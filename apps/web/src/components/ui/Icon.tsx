'use client'

/**
 * Icon — the one place that knows which Phosphor glyph a semantic name means
 * (Redesign Brief §3). Pages ask for `<Icon name="gyankosh" />`, never for a
 * glyph. Rules: regular weight by default; `active` swaps to fill; feature and
 * tool tiles use `duotone`.
 */

import type { ComponentType } from 'react'
import {
  HouseSimple, GraduationCap, Sparkle, ChartLineUp, SquaresFour, BookOpenText, Exam, Notebook, Cards,
  Translate, MagnifyingGlassPlus, Brain, PenNib, Camera, Lightning, Certificate, ChartBar, CreditCard,
  Receipt, UserCircle, Chalkboard, UsersThree, ClipboardText, CalendarCheck, Megaphone, VideoCamera,
  SealCheck, UsersFour, ChatsCircle, FileText, Buildings, PlusSquare, Tag, IdentificationBadge, UserPlus,
  Files, Stack, FilmStrip, Database, Gauge, TrendUp, ListChecks, TreeStructure, Layout, VideoConference,
  SlidersHorizontal, PlugsConnected, GearSix, Warning, Fire, Bell, ArrowLeft, Plus, ArrowUp, Microphone,
  SpeakerHigh, BookmarkSimple, ArrowRight, ArrowUpRight, Check, CheckCircle, X, XCircle, Minus, List, Sun, Moon,
  SunHorizon, MoonStars, Target, WifiSlash, DeviceMobile, ChatCircleText, Robot, Books, Shield,
  ShieldCheck, Timer, MagnifyingGlass, PlayCircle, Student, Monitor, SignOut, CaretRight, CaretDown,
  FacebookLogo, TwitterLogo, InstagramLogo, LinkedinLogo, YoutubeLogo, EnvelopeSimple, Phone, MapPin,
  CellSignalFull, WifiHigh, BatteryFull, Lock, Heart, Rocket, Folder, FolderOpen, Trash, PencilSimple,
} from '@phosphor-icons/react'

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'

type PhosphorComponent = ComponentType<{ size?: number | string; weight?: IconWeight; className?: string; color?: string; 'aria-hidden'?: boolean }>

const MAP: Record<string, PhosphorComponent> = {
  // nav + features (brief §3 table)
  home: HouseSimple, dashboard: HouseSimple, learn: GraduationCap, classroom: GraduationCap, gyankosh: Sparkle, tutor: Sparkle,
  progress: ChartLineUp, more: SquaresFour, materials: BookOpenText, practest: Exam, sanchika: Notebook, flashcards: Cards,
  shabdakosh: Translate, sarvagya: MagnifyingGlassPlus, mitram: Brain, inkbuddy: PenNib, scan: Camera, productivity: Lightning,
  certificates: Certificate, analytics: ChartBar, billing: CreditCard, purchases: Receipt, profile: UserCircle, classes: Chalkboard,
  students: UsersThree, people: UsersThree, assignments: ClipboardText, attendance: CalendarCheck, notices: Megaphone,
  live: VideoCamera, validation: SealCheck, wards: UsersFour, messages: ChatsCircle, reports: FileText, organizations: Buildings,
  onboard: PlusSquare, plans: Tag, approvals: IdentificationBadge, 'join-requests': UserPlus, content: Files, batches: Stack,
  videos: FilmStrip, 'vector-db': Database, performance: Gauge, revenue: TrendUp, evaluation: ListChecks, taxonomy: TreeStructure,
  templates: Layout, zoom: VideoConference, features: SlidersHorizontal, integrations: PlugsConnected, settings: GearSix,
  danger: Warning, streak: Fire, notifications: Bell, back: ArrowLeft, add: Plus, send: ArrowUp, mic: Microphone, listen: SpeakerHigh,
  save: BookmarkSimple,
  // general
  arrow: ArrowRight, 'arrow-up-right': ArrowUpRight, check: Check, 'check-circle': CheckCircle, x: X, 'x-circle': XCircle,
  minus: Minus, menu: List, sun: Sun, moon: Moon, 'sun-horizon': SunHorizon, 'moon-stars': MoonStars, target: Target,
  wifi: WifiHigh, 'wifi-slash': WifiSlash, mobile: DeviceMobile, chat: ChatCircleText, robot: Robot, books: Books, shield: Shield,
  'shield-check': ShieldCheck, timer: Timer, search: MagnifyingGlass, play: PlayCircle, student: Student, monitor: Monitor,
  'sign-out': SignOut, 'caret-right': CaretRight, 'caret-down': CaretDown, facebook: FacebookLogo, twitter: TwitterLogo,
  instagram: InstagramLogo, linkedin: LinkedinLogo, youtube: YoutubeLogo, mail: EnvelopeSimple, phone: Phone, pin: MapPin,
  signal: CellSignalFull, 'wifi-high': WifiHigh, battery: BatteryFull, lock: Lock, heart: Heart, rocket: Rocket, folder: Folder,
  'folder-open': FolderOpen, trash: Trash, edit: PencilSimple, stack: Stack, buildings: Buildings, 'users-four': UsersFour,
  'calendar-check': CalendarCheck, 'chats-circle': ChatsCircle, 'book-open-text': BookOpenText, 'file-text': FileText,
  'graduation-cap': GraduationCap, 'chart-bar': ChartBar, 'magnifying-glass-plus': MagnifyingGlassPlus, 'pen-nib': PenNib,
  camera: Camera, cards: Cards, exam: Exam, translate: Translate, certificate: Certificate, brain: Brain, files: Files,
  'seal-check': SealCheck, 'video-camera': VideoCamera, fire: Fire, sparkle: Sparkle, 'chat-circle-text': ChatCircleText,
  'credit-card': CreditCard,
}

export type IconName = keyof typeof MAP | (string & {})

export interface IconProps {
  name: IconName
  /** px. Default 22 (brief: 22–24). */
  size?: number
  /** Active state swaps regular → fill (bottom nav, rail, sidebar, segmented controls). */
  active?: boolean
  /** Explicit weight; wins over `active`. Feature and tool tiles pass 'duotone'. */
  weight?: IconWeight
  className?: string
  color?: string
}

export function Icon({ name, size = 22, active = false, weight, className, color }: IconProps) {
  const Glyph = MAP[name] ?? Sparkle
  return <Glyph size={size} weight={weight ?? (active ? 'fill' : 'regular')} className={className} color={color} aria-hidden />
}

export default Icon
