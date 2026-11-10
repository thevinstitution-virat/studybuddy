import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import { schema } from '@/db';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // SECURITY (Phase 0): fail closed. There is no default secret, and an invalid signature is rejected in
    // every environment (it used to fall back to 'dummy_webhook_secret' and skip the check outside production).
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('razorpay webhook: RAZORPAY_WEBHOOK_SECRET is not configured; rejecting');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }
    const expected = Buffer.from(crypto.createHmac('sha256', secret).update(bodyText).digest('hex'));
    const provided = Buffer.from(signature);
    if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);

    if (payload.event === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;
      const razorpayTransferId = paymentEntity.transfers && paymentEntity.transfers.length > 0 ? paymentEntity.transfers[0].id : null;

      // Idempotency check:
      const existingPayment = await db.query.payments.findFirst({
        where: eq(schema.payments.razorpayPaymentId, razorpayPaymentId)
      });

      if (existingPayment) {
        return new NextResponse('ok', { status: 200 });
      }

      // 1. Get the order
      const order = await db.query.orders.findFirst({
        where: eq(schema.orders.razorpayOrderId, razorpayOrderId)
      });

      if (!order) {
        console.error('Webhook received for unknown order:', razorpayOrderId);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // 2. Database transaction
      await db.transaction(async (tx) => {
        // a. Update order status
        await tx.update(schema.orders)
          .set({ status: 'captured' })
          .where(eq(schema.orders.id, order.id));

        // b. Insert payment
        await tx.insert(schema.payments)
          .values({
            id: crypto.randomUUID(),
            orderId: order.id,
            razorpayPaymentId,
            razorpayTransferId,
            status: 'captured',
            capturedAt: new Date(),
          });

        // c. Ensure membership
        await tx.insert(schema.member)
          .values({
            id: crypto.randomUUID(),
            organizationId: order.orgId,
            userId: order.studentId,
            role: 'student',
            createdAt: new Date(),
          })
          .onConflictDoUpdate({ target: [schema.member.userId, schema.member.organizationId], set: { organizationId: order.orgId } });

        // d. Update enrollment
        await tx.update(schema.enrollments)
          .set({ status: 'active' })
          .where(and(
            eq(schema.enrollments.batchId, order.batchId),
            eq(schema.enrollments.userId, order.studentId)
          ));
      });

      return new NextResponse('ok', { status: 200 });
    } else if (payload.event === 'payment.failed') {
      const razorpayOrderId = payload.payload.payment.entity.order_id;

      const order = await db.query.orders.findFirst({
        where: eq(schema.orders.razorpayOrderId, razorpayOrderId)
      });

      if (!order) {
        console.error('Webhook received payment.failed for unknown order:', razorpayOrderId);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      await db.transaction(async (tx) => {
        // Mark the order as failed
        await tx.update(schema.orders)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(eq(schema.orders.razorpayOrderId, razorpayOrderId));

        // Remove the pending_payment enrollment entirely
        await tx.delete(schema.enrollments)
          .where(
            and(
              eq(schema.enrollments.batchId, order.batchId),
              eq(schema.enrollments.userId, order.studentId),
              eq(schema.enrollments.status, 'pending_payment')
            )
          );
      });

      return new NextResponse('ok', { status: 200 });
    }

    return new NextResponse('ignored', { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
