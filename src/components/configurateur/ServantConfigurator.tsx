'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  RotateCcw,
  Search,
  X,
  Plus,
  Trash2,
  Download,
} from 'lucide-react'
import {
  cabinets,
  topChests,
  inserts,
  insertCategories,
  sizeToNumber,
  canFitInDrawer,
  type Cabinet,
  type TopChest,
  type Insert,
  type DrawerConfig,
} from '@/lib/servante-data'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const STEPS = [
  { id: 'cabinet', label: 'Servante' },
  { id: 'upgrade', label: 'Stockage +' },
  { id: 'inserts', label: 'Inserts' },
  { id: 'summary', label: 'Résumé' },
] as const

type StepId = (typeof STEPS)[number]['id']

const fadeVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export default function ServantConfigurator() {
  const [currentStep, setCurrentStep] = useState<StepId>('cabinet')
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null)
  const [selectedTopChest, setSelectedTopChest] = useState<TopChest | null>(null)
  const [drawerConfigs, setDrawerConfigs] = useState<Map<number, DrawerConfig>>(new Map())
  const [activeDrawer, setActiveDrawer] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [drawerFullFeedback, setDrawerFullFeedback] = useState<number | null>(null)

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep)

  const goToStep = useCallback((step: StepId) => {
    setCurrentStep(step)
  }, [])

  const nextStep = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.id === currentStep)
    if (idx < STEPS.length - 1) {
      const next = STEPS[idx + 1].id
      // Skip step 2 when going forward if no compatible top chests
      if (next === 'upgrade' && selectedCabinet && !topChests.some((tc) => tc.compatibleCabinets.includes(selectedCabinet.id))) {
        setCurrentStep('inserts')
      } else {
        setCurrentStep(next)
      }
    }
  }, [currentStep, selectedCabinet])

  const prevStep = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.id === currentStep)
    if (idx > 0) {
      const prev = STEPS[idx - 1].id
      // Skip step 2 when going back if no compatible top chests
      if (prev === 'upgrade' && selectedCabinet && !topChests.some((tc) => tc.compatibleCabinets.includes(selectedCabinet.id))) {
        setCurrentStep('cabinet')
      } else {
        setCurrentStep(prev)
      }
    }
  }, [currentStep, selectedCabinet])

  const selectCabinet = useCallback(
    (cabinet: Cabinet) => {
      setSelectedCabinet(cabinet)
      setSelectedTopChest(null)
      setDrawerConfigs(new Map())
      setActiveDrawer(1)
      // Skip step 2 if no compatible top chests for this cabinet
      const hasChests = topChests.some((tc) => tc.compatibleCabinets.includes(cabinet.id))
      setCurrentStep(hasChests ? 'upgrade' : 'inserts')
    },
    []
  )

  const compatibleChests = useMemo(() => {
    if (!selectedCabinet) return []
    return topChests.filter((tc) => tc.compatibleCabinets.includes(selectedCabinet.id))
  }, [selectedCabinet])

  const hasCompatibleChests = compatibleChests.length > 0

  const getDrawerConfig = useCallback(
    (drawerId: number): DrawerConfig => {
      return drawerConfigs.get(drawerId) || { drawerId, inserts: [], totalSize: 0 }
    },
    [drawerConfigs]
  )

  const addInsertToDrawer = useCallback(
    (insert: Insert) => {
      if (activeDrawer === null || !selectedCabinet) return
      const config = getDrawerConfig(activeDrawer)
      if (!canFitInDrawer(config.totalSize, insert.size)) return

      const newTotalSize = config.totalSize + sizeToNumber(insert.size)
      const newConfig: DrawerConfig = {
        ...config,
        inserts: [...config.inserts, insert],
        totalSize: newTotalSize,
      }
      setDrawerConfigs((prev) => new Map(prev).set(activeDrawer, newConfig))

      // Auto-advance to next empty drawer when current is full
      if (newTotalSize >= 3) {
        const topChestCount = selectedTopChest?.drawers ?? 0
        const total = selectedCabinet.configurableDrawers + topChestCount
        const allIds = Array.from({ length: total }, (_, i) => i + 1)
        const nextEmpty = allIds.find((id) => {
          if (id === activeDrawer) return false
          const c = drawerConfigs.get(id)
          return !c || c.totalSize < 3
        })
        setDrawerFullFeedback(activeDrawer)
        setTimeout(() => {
          setDrawerFullFeedback(null)
          if (nextEmpty !== undefined) {
            setActiveDrawer(nextEmpty)
          }
        }, 800)
      }
    },
    [activeDrawer, getDrawerConfig, selectedCabinet, selectedTopChest, drawerConfigs]
  )

  const removeInsertFromDrawer = useCallback(
    (drawerId: number, insertIndex: number) => {
      const config = getDrawerConfig(drawerId)
      const removedInsert = config.inserts[insertIndex]
      const newInserts = config.inserts.filter((_, i) => i !== insertIndex)
      const newConfig: DrawerConfig = {
        drawerId,
        inserts: newInserts,
        totalSize: config.totalSize - sizeToNumber(removedInsert.size),
      }
      setDrawerConfigs((prev) => new Map(prev).set(drawerId, newConfig))
    },
    [getDrawerConfig]
  )

  const resetDrawer = useCallback(
    (drawerId: number) => {
      setDrawerConfigs((prev) => {
        const next = new Map(prev)
        next.delete(drawerId)
        return next
      })
    },
    []
  )

  const resetAllDrawers = useCallback(() => {
    setDrawerConfigs(new Map())
  }, [])

  const filteredInserts = useMemo(() => {
    let filtered = inserts
    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter((i) => i.category === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (i) => i.name.toLowerCase().includes(q) || i.id.includes(q)
      )
    }
    return filtered
  }, [selectedCategory, searchQuery])

  const totalConfiguredDrawers = useMemo(() => {
    let count = 0
    drawerConfigs.forEach((config) => {
      if (config.inserts.length > 0) count++
    })
    return count
  }, [drawerConfigs])

  const allInserts = useMemo(() => {
    const all: { drawer: number; insert: Insert }[] = []
    drawerConfigs.forEach((config, drawerId) => {
      config.inserts.forEach((insert) => {
        all.push({ drawer: drawerId, insert })
      })
    })
    return all
  }, [drawerConfigs])

  return (
    <div className="min-h-screen bg-white">
      {/* Step indicator */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={prevStep}
              disabled={stepIndex === 0}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] disabled:opacity-30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 sm:gap-3">
              {STEPS.map((step, i) => {
                // Hide step 2 when no compatible chests
                if (step.id === 'upgrade' && !hasCompatibleChests && selectedCabinet) return null
                const isActive = step.id === currentStep
                const isCompleted = i < stepIndex || (step.id === 'upgrade' && !hasCompatibleChests && selectedCabinet)
                const isClickable =
                  (isCompleted && !(step.id === 'upgrade' && !hasCompatibleChests)) ||
                  (step.id === 'upgrade' && selectedCabinet && hasCompatibleChests) ||
                  (step.id === 'inserts' && selectedCabinet) ||
                  (step.id === 'summary' && selectedCabinet)

                return (
                  <button
                    key={step.id}
                    onClick={() => isClickable && goToStep(step.id)}
                    disabled={!isClickable}
                    className="flex items-center gap-1 sm:gap-2 disabled:opacity-30"
                  >
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold transition-colors ${
                        isActive
                          ? 'bg-[#DB021D] text-white'
                          : isCompleted
                            ? 'bg-[#1A1A1A] text-white'
                            : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <span
                      className={`text-[9px] sm:text-[11px] font-semibold ${
                        isActive ? 'text-[#1A1A1A]' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className="w-4 sm:w-8 h-px bg-gray-200 mx-0.5 sm:mx-1" />
                    )}
                  </button>
                )
              })}
            </div>

            <button
              onClick={nextStep}
              disabled={stepIndex === STEPS.length - 1 || !selectedCabinet}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] disabled:opacity-30 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={fadeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {currentStep === 'cabinet' && (
            <StepCabinet onSelect={selectCabinet} selected={selectedCabinet} />
          )}
          {currentStep === 'upgrade' && selectedCabinet && (
            <StepUpgrade
              cabinet={selectedCabinet}
              compatibleChests={compatibleChests}
              selectedTopChest={selectedTopChest}
              onSelectTopChest={setSelectedTopChest}
              onSkip={nextStep}
            />
          )}
          {currentStep === 'inserts' && selectedCabinet && (
            <StepInserts
              cabinet={selectedCabinet}
              topChest={selectedTopChest}
              activeDrawer={activeDrawer}
              setActiveDrawer={setActiveDrawer}
              getDrawerConfig={getDrawerConfig}
              addInsertToDrawer={addInsertToDrawer}
              removeInsertFromDrawer={removeInsertFromDrawer}
              resetDrawer={resetDrawer}
              resetAllDrawers={resetAllDrawers}
              filteredInserts={filteredInserts}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              showCategoryDropdown={showCategoryDropdown}
              setShowCategoryDropdown={setShowCategoryDropdown}
              drawerFullFeedback={drawerFullFeedback}
              onNext={nextStep}
            />
          )}
          {currentStep === 'summary' && selectedCabinet && (
            <StepSummary
              cabinet={selectedCabinet}
              topChest={selectedTopChest}
              drawerConfigs={drawerConfigs}
              totalConfiguredDrawers={totalConfiguredDrawers}
              allInserts={allInserts}
              onRestart={() => {
                setSelectedCabinet(null)
                setSelectedTopChest(null)
                setDrawerConfigs(new Map())
                setActiveDrawer(null)
                goToStep('cabinet')
              }}
              onEditDrawers={() => goToStep('inserts')}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Step 1: Cabinet Selection ──────────────────────────────────────────────

function StepCabinet({
  onSelect,
  selected,
}: {
  onSelect: (c: Cabinet) => void
  selected: Cabinet | null
}) {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1
          className="text-[24px] sm:text-[32px] font-black uppercase text-[#1A1A1A] leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Configurez votre servante
        </h1>
        <p className="text-[13px] text-[#6B7280] mt-2">
          Sélectionnez votre servante pour commencer la personnalisation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cabinets.map((cabinet) => (
          <button
            key={cabinet.id}
            onClick={() => onSelect(cabinet)}
            className={`group relative bg-[#F5F5F5] rounded-lg overflow-hidden border-2 transition-all duration-200 text-left ${
              selected?.id === cabinet.id
                ? 'border-[#DB021D] shadow-lg'
                : 'border-transparent hover:border-gray-300 hover:shadow-md'
            }`}
          >
            {selected?.id === cabinet.id && (
              <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-[#DB021D] flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}

            <div className="relative aspect-[4/3] bg-[#F5F5F5] p-4 flex items-center justify-center">
              <Image
                src={cabinet.image}
                alt={cabinet.name}
                width={280}
                height={210}
                className="object-contain max-h-[200px] group-hover:scale-[1.03] transition-transform duration-300"
                unoptimized
              />
            </div>

            <div className="p-4 bg-white">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-3 h-3 rounded-full border ${
                    cabinet.color === 'red'
                      ? 'bg-[#DB021D] border-[#B8011A]'
                      : 'bg-[#2D2D2D] border-[#1A1A1A]'
                  }`}
                />
                <span className="text-[10px] uppercase font-semibold text-[#6B7280]">
                  {cabinet.color === 'red' ? 'Rouge' : 'Noir'}
                </span>
              </div>
              <h3 className="text-[13px] font-bold text-[#1A1A1A] leading-tight">
                {cabinet.name}
              </h3>
              <p className="text-[11px] text-[#6B7280] mt-1">
                {cabinet.drawers} tiroirs &middot; {cabinet.width}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 2: Upgrade Storage ────────────────────────────────────────────────

function StepUpgrade({
  cabinet,
  compatibleChests,
  selectedTopChest,
  onSelectTopChest,
  onSkip,
}: {
  cabinet: Cabinet
  compatibleChests: TopChest[]
  selectedTopChest: TopChest | null
  onSelectTopChest: (tc: TopChest | null) => void
  onSkip: () => void
}) {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="text-center mb-2">
        <p className="text-[11px] uppercase font-semibold text-[#DB021D] tracking-wider">
          {cabinet.name}
        </p>
      </div>
      <div className="text-center mb-8">
        <h2
          className="text-[22px] sm:text-[28px] font-black uppercase text-[#1A1A1A] leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Augmenter votre stockage ?
        </h2>
        <p className="text-[13px] text-[#6B7280] mt-2">
          Ajoutez un coffre supérieur pour encore plus de rangement
        </p>
      </div>

      {compatibleChests.length > 0 ? (
        <div className="max-w-md mx-auto space-y-4">
          {compatibleChests.map((chest) => (
            <button
              key={chest.id}
              onClick={() =>
                onSelectTopChest(selectedTopChest?.id === chest.id ? null : chest)
              }
              className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedTopChest?.id === chest.id
                  ? 'border-[#DB021D] bg-red-50/30'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="relative w-24 h-24 flex-shrink-0 bg-[#F5F5F5] rounded-lg overflow-hidden">
                <Image
                  src={chest.image}
                  alt={chest.name}
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-bold text-[#1A1A1A] leading-tight">
                  {chest.name}
                </h3>
                <p className="text-[11px] text-[#6B7280] mt-1">Réf: {chest.ref}</p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  selectedTopChest?.id === chest.id
                    ? 'border-[#DB021D] bg-[#DB021D]'
                    : 'border-gray-300'
                }`}
              >
                {selectedTopChest?.id === chest.id && (
                  <Check className="w-3.5 h-3.5 text-white" />
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center p-8 bg-[#F5F5F5] rounded-lg">
          <p className="text-[13px] text-[#6B7280]">
            Aucun coffre supérieur compatible avec cette servante
          </p>
        </div>
      )}

      <div className="max-w-md mx-auto mt-8 space-y-3">
        <button
          onClick={onSkip}
          className="w-full h-11 bg-[#DB021D] hover:bg-[#B8011A] text-white text-[13px] font-semibold rounded-lg transition-colors uppercase tracking-wide"
        >
          Passer à la personnalisation des tiroirs
        </button>
      </div>
    </div>
  )
}

// ─── Drawer zone overlay data ────────────────────────────────────────────────

// ─── Cabinet Drawer Diagram (CSS-only, no image) ─────────────────────────────

function CabinetFrontalView({
  cabinet,
  topChest,
  activeDrawer,
  setActiveDrawer,
  getDrawerConfig,
}: {
  cabinet: Cabinet
  topChest: TopChest | null
  activeDrawer: number | null
  setActiveDrawer: (d: number | null) => void
  getDrawerConfig: (d: number) => DrawerConfig
}) {
  const hasTopChest = topChest !== null
  const isRed = cabinet.color === 'red'

  // Determine if last base drawer is a "big" drawer (double height)
  // STC30 (6 drawers) and STC27 (6 drawers) have a bigger bottom drawer
  const hasBigBottom = cabinet.configurableDrawers === 6

  // Build drawer list: top chest first, then base drawers
  const sections: { id: number; label: string; isBig: boolean; isExtension: boolean }[] = []
  if (hasTopChest) {
    for (let i = 0; i < topChest!.drawers; i++) {
      sections.push({
        id: cabinet.configurableDrawers + i + 1,
        label: `Ext. ${i + 1}`,
        isBig: false,
        isExtension: true,
      })
    }
  }
  for (let i = 1; i <= cabinet.configurableDrawers; i++) {
    const isBig = hasBigBottom && i === cabinet.configurableDrawers
    sections.push({ id: i, label: `${i}`, isBig, isExtension: false })
  }

  const drawerColor = isRed ? '#DB021D' : '#3A3A3A'
  const drawerColorHover = isRed ? '#C5011A' : '#4A4A4A'

  return (
    <div className="px-4 pb-3">
      {/* Cabinet schematic */}
      <div className="mx-auto max-w-[260px]">
        {/* Top chest section */}
        {hasTopChest && (
          <>
            <div className="rounded-t-lg border border-b-0 border-white/15 bg-[#2A2A2A] overflow-hidden">
              <div className="p-1.5 space-y-[3px]">
                {sections.filter(s => s.isExtension).map(drawer => {
                  const isActive = activeDrawer === drawer.id
                  const config = getDrawerConfig(drawer.id)
                  const hasInserts = config.inserts.length > 0
                  const isFull = config.totalSize >= 3

                  return (
                    <button
                      key={drawer.id}
                      onClick={() => setActiveDrawer(drawer.id)}
                      className="w-full relative flex items-center justify-center rounded-[3px] transition-all duration-150 cursor-pointer"
                      style={{
                        height: 28,
                        background: isActive ? '#fff' : drawerColor,
                        boxShadow: isActive
                          ? '0 0 12px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.5)'
                          : `inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.2)`,
                      }}
                      onMouseEnter={e => { if (activeDrawer !== drawer.id) e.currentTarget.style.background = drawerColorHover }}
                      onMouseLeave={e => { if (activeDrawer !== drawer.id) e.currentTarget.style.background = drawerColor }}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-[#1A1A1A]' : 'text-white/80'}`}>
                        {drawer.label}
                      </span>
                      {/* Capacity dots */}
                      <span className="absolute right-2 flex gap-[3px]">
                        {[1, 2, 3].map(s => (
                          <span
                            key={s}
                            className={`w-[6px] h-[6px] rounded-full ${
                              s <= config.totalSize
                                ? isFull ? 'bg-emerald-400' : isActive ? 'bg-[#DB021D]' : 'bg-white/70'
                                : isActive ? 'bg-[#1A1A1A]/15' : 'bg-white/15'
                            }`}
                          />
                        ))}
                      </span>
                      {/* Handle line */}
                      <span className={`absolute left-1/2 -translate-x-1/2 bottom-[3px] w-6 h-[2px] rounded-full ${isActive ? 'bg-[#1A1A1A]/20' : 'bg-white/20'}`} />
                    </button>
                  )
                })}
              </div>
            </div>
            {/* Connector between top chest and base */}
            <div className="h-1.5 mx-4 border-x border-white/10 bg-[#222]" />
          </>
        )}

        {/* Base cabinet */}
        <div className={`${hasTopChest ? 'rounded-b-lg' : 'rounded-lg'} border border-white/15 bg-[#2A2A2A] overflow-hidden`}>
          {/* Top surface */}
          <div className="h-2.5 bg-gradient-to-b from-[#444] to-[#333] border-b border-white/10" />

          {/* Drawers area */}
          <div className="p-1.5 space-y-[3px]">
            {sections.filter(s => !s.isExtension).map(drawer => {
              const isActive = activeDrawer === drawer.id
              const config = getDrawerConfig(drawer.id)
              const hasInserts = config.inserts.length > 0
              const isFull = config.totalSize >= 3

              return (
                <button
                  key={drawer.id}
                  onClick={() => setActiveDrawer(drawer.id)}
                  className="w-full relative flex items-center justify-center rounded-[3px] transition-all duration-150 cursor-pointer"
                  style={{
                    height: drawer.isBig ? 52 : 32,
                    background: isActive ? '#fff' : drawerColor,
                    boxShadow: isActive
                      ? '0 0 12px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.5)'
                      : `inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.2)`,
                  }}
                  onMouseEnter={e => { if (activeDrawer !== drawer.id) e.currentTarget.style.background = drawerColorHover }}
                  onMouseLeave={e => { if (activeDrawer !== drawer.id) e.currentTarget.style.background = drawerColor }}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-[#1A1A1A]' : 'text-white/80'}`}>
                    Tiroir {drawer.label}
                  </span>
                  {/* Capacity dots */}
                  <span className="absolute right-2 flex gap-[3px]">
                    {[1, 2, 3].map(s => (
                      <span
                        key={s}
                        className={`w-[6px] h-[6px] rounded-full ${
                          s <= config.totalSize
                            ? isFull ? 'bg-emerald-400' : isActive ? 'bg-[#DB021D]' : 'bg-white/70'
                            : isActive ? 'bg-[#1A1A1A]/15' : 'bg-white/15'
                        }`}
                      />
                    ))}
                  </span>
                  {/* Handle line */}
                  <span className={`absolute left-1/2 -translate-x-1/2 bottom-[4px] w-8 h-[2px] rounded-full ${isActive ? 'bg-[#1A1A1A]/20' : 'bg-white/20'}`} />
                </button>
              )
            })}
          </div>

          {/* Bottom branding area */}
          <div className="h-6 mx-1.5 mb-1.5 rounded-[3px] bg-gradient-to-b from-[#B8011A] to-[#8B0013] flex items-center justify-center">
            <span className="text-[8px] font-black text-white/60 tracking-widest uppercase">Milwaukee</span>
          </div>
        </div>

        {/* Wheels */}
        <div className="flex justify-between px-3 -mt-0.5">
          <div className="w-4 h-3 rounded-b-full bg-[#333] border border-t-0 border-white/10" />
          <div className="w-4 h-3 rounded-b-full bg-[#333] border border-t-0 border-white/10" />
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Inserts ────────────────────────────────────────────────────────

function StepInserts({
  cabinet,
  topChest,
  activeDrawer,
  setActiveDrawer,
  getDrawerConfig,
  addInsertToDrawer,
  removeInsertFromDrawer,
  resetDrawer,
  resetAllDrawers,
  filteredInserts,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  showCategoryDropdown,
  setShowCategoryDropdown,
  drawerFullFeedback,
  onNext,
}: {
  cabinet: Cabinet
  topChest: TopChest | null
  activeDrawer: number | null
  setActiveDrawer: (d: number | null) => void
  getDrawerConfig: (d: number) => DrawerConfig
  addInsertToDrawer: (i: Insert) => void
  removeInsertFromDrawer: (d: number, idx: number) => void
  resetDrawer: (d: number) => void
  resetAllDrawers: () => void
  filteredInserts: Insert[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCategory: string
  setSelectedCategory: (c: string) => void
  showCategoryDropdown: boolean
  setShowCategoryDropdown: (v: boolean) => void
  drawerFullFeedback: number | null
  onNext: () => void
}) {
  const [showDrawerDropdown, setShowDrawerDropdown] = useState(false)
  const [frontalCollapsed, setFrontalCollapsed] = useState(false)
  const insertGridRef = useRef<HTMLDivElement>(null)
  const topChestDrawers = topChest?.drawers ?? 0
  const totalDrawers = cabinet.configurableDrawers + topChestDrawers

  const drawerLabel = (id: number) =>
    id > cabinet.configurableDrawers
      ? `Extension ${id - cabinet.configurableDrawers}`
      : `Tiroir ${id}`

  const allDrawerIds = Array.from({ length: totalDrawers }, (_, i) => i + 1)

  // Auto-select first drawer if none selected
  useEffect(() => {
    if (activeDrawer === null) {
      setActiveDrawer(1)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // On mobile: collapse frontal view + scroll to inserts when drawer changes
  useEffect(() => {
    if (activeDrawer !== null && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setFrontalCollapsed(true)
      setTimeout(() => {
        insertGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }, [activeDrawer])

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 pb-36 lg:pb-6">
      {/* Cabinet name */}
      <div className="text-center mb-4">
        <p className="text-[11px] uppercase font-semibold text-[#DB021D] tracking-wider">
          {cabinet.name}
        </p>
      </div>

      <div className="lg:flex lg:gap-8">
        {/* Left: Cabinet frontal view with clickable drawer zones */}
        <div className="lg:w-[360px] flex-shrink-0 mb-6 lg:mb-0">
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden lg:sticky lg:top-24">
            {/* Collapsible header - clickable on mobile */}
            <button
              onClick={() => setFrontalCollapsed(!frontalCollapsed)}
              className="w-full flex items-center justify-between px-4 py-3 lg:justify-center"
            >
              <h3 className="text-[13px] font-bold text-white tracking-wide">
                {activeDrawer !== null ? drawerLabel(activeDrawer) : 'Sélectionnez un tiroir'}
              </h3>
              <ChevronDown
                className={`w-4 h-4 text-white/60 lg:hidden transition-transform ${frontalCollapsed ? '' : 'rotate-180'}`}
              />
            </button>

            <div className={`${frontalCollapsed ? 'hidden lg:block' : 'block'}`}>
            {cabinet.id === 'wtc40' ? (
              /* SWC40 work cart: only 1 drawer, use simple button */
              <div className="px-4 pb-4">
                <button
                  onClick={() => setActiveDrawer(1)}
                  className={`w-full h-12 rounded-lg flex items-center justify-center transition-all text-[13px] font-bold uppercase tracking-wider ${
                    activeDrawer === 1
                      ? 'bg-white/20 border-2 border-white text-white'
                      : 'border-2 border-dashed border-white/40 text-white/60 hover:border-white/60 hover:bg-white/10'
                  }`}
                >
                  TIROIR 1
                </button>
              </div>
            ) : (
              <CabinetFrontalView
                cabinet={cabinet}
                topChest={topChest}
                activeDrawer={activeDrawer}
                setActiveDrawer={setActiveDrawer}
                getDrawerConfig={getDrawerConfig}
              />
            )}

            {/* Reset buttons */}
            <div className="flex gap-2 px-4 py-3 border-t border-white/10">
              {activeDrawer !== null && (
                <button
                  onClick={() => resetDrawer(activeDrawer)}
                  className="flex-1 h-8 text-[11px] font-semibold text-white/50 hover:text-white border border-white/20 hover:border-white/40 rounded-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Ce tiroir
                </button>
              )}
              <button
                onClick={resetAllDrawers}
                className="flex-1 h-8 text-[11px] font-semibold text-white/50 hover:text-[#DB021D] border border-white/20 hover:border-white/40 rounded-md flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Tous les tiroirs
              </button>
            </div>
            </div>{/* end collapsible */}

            {/* Summary CTA - desktop only */}
            <div className="hidden lg:block px-4 pb-4">
              <button
                onClick={onNext}
                className="w-full h-11 bg-[#DB021D] hover:bg-[#B8011A] text-white text-[12px] font-semibold rounded-lg transition-colors uppercase tracking-wide"
              >
                Voir le résumé
              </button>
            </div>
          </div>
        </div>

        {/* Right: Insert selection or drawer contents */}
        <div className="flex-1 min-w-0" ref={insertGridRef}>
          {activeDrawer !== null ? (
            <>
              {/* Active drawer header with capacity */}
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-[16px] font-bold text-[#1A1A1A]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {drawerLabel(activeDrawer)}
                </h3>
                <DrawerCapacityBar config={getDrawerConfig(activeDrawer)} />
              </div>

              {/* Current inserts in this drawer */}
              {getDrawerConfig(activeDrawer).inserts.length > 0 && (
                <div className="mb-4 p-3 bg-[#F5F5F5] rounded-lg">
                  <p className="text-[11px] font-semibold text-[#6B7280] uppercase mb-2">
                    Contenu du tiroir
                  </p>
                  <div className="space-y-2">
                    {getDrawerConfig(activeDrawer).inserts.map((insert, idx) => (
                      <div
                        key={`${insert.id}-${idx}`}
                        className="flex items-center gap-3 bg-white rounded-md p-2"
                      >
                        <div className="relative w-12 h-12 bg-[#F5F5F5] rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={insert.image}
                            alt={insert.name}
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-[#1A1A1A] leading-tight truncate">
                            {insert.name}
                          </p>
                          <SizeBadge size={insert.size} />
                        </div>
                        <button
                          onClick={() => removeInsertFromDrawer(activeDrawer, idx)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-[#6B7280] hover:text-[#DB021D] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter controls & search */}
              {getDrawerConfig(activeDrawer).totalSize < 3 && (
                <>
                  {/* Mobile drawer selector + category filter row */}
                  <div className="flex gap-2 mb-3">
                    {/* Mobile drawer dropdown */}
                    <div className="relative lg:hidden">
                      <button
                        onClick={() => setShowDrawerDropdown(!showDrawerDropdown)}
                        className="h-9 px-3 bg-[#1A1A1A] rounded-lg text-[11px] font-bold text-white flex items-center gap-1.5 uppercase tracking-wider"
                      >
                        <span className="flex gap-0.5 mr-1">
                          {[1, 2, 3].map(s => (
                            <span key={s} className={`w-1.5 h-1.5 rounded-sm ${s <= getDrawerConfig(activeDrawer).totalSize ? 'bg-[#DB021D]' : 'bg-white/30'}`} />
                          ))}
                        </span>
                        {drawerLabel(activeDrawer)}
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${showDrawerDropdown ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {showDrawerDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setShowDrawerDropdown(false)}
                          />
                          <div className="absolute top-full left-0 mt-1 z-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[200px]">
                            {allDrawerIds.map((id) => {
                              const config = getDrawerConfig(id)
                              const isActive = activeDrawer === id
                              return (
                                <button
                                  key={id}
                                  onClick={() => {
                                    setActiveDrawer(id)
                                    setShowDrawerDropdown(false)
                                  }}
                                  className={`w-full text-left px-3 py-2.5 text-[12px] flex items-center justify-between hover:bg-[#F5F5F5] transition-colors ${
                                    isActive ? 'font-bold text-[#DB021D]' : 'text-[#1A1A1A]'
                                  }`}
                                >
                                  <span className="font-semibold uppercase text-[11px]">{drawerLabel(id)}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="flex gap-0.5">
                                      {[1, 2, 3].map(s => (
                                        <span key={s} className={`w-2 h-1.5 rounded-sm ${s <= config.totalSize ? 'bg-[#DB021D]' : 'bg-gray-200'}`} />
                                      ))}
                                    </span>
                                    {config.totalSize >= 3 && <Check className="w-3 h-3 text-emerald-500" />}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Category dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className="h-9 px-3 bg-[#F5F5F5] rounded-lg text-[11px] font-semibold text-[#1A1A1A] flex items-center gap-1.5 hover:bg-gray-200 transition-colors"
                      >
                        {selectedCategory}
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {showCategoryDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setShowCategoryDropdown(false)}
                          />
                          <div className="absolute top-full left-0 mt-1 z-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[180px]">
                            {insertCategories.map((cat) => (
                              <button
                                key={cat}
                                onClick={() => {
                                  setSelectedCategory(cat)
                                  setShowCategoryDropdown(false)
                                }}
                                className={`w-full text-left px-3 py-2 text-[12px] hover:bg-[#F5F5F5] transition-colors ${
                                  selectedCategory === cat
                                    ? 'font-bold text-[#DB021D]'
                                    : 'text-[#1A1A1A]'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Search - hidden on very small screens, full on sm+ */}
                    <div className="flex-1 relative hidden sm:block">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un insert..."
                        className="w-full h-9 pl-8 pr-8 bg-[#F5F5F5] rounded-lg text-[12px] text-[#1A1A1A] placeholder:text-[#6B7280] outline-none focus:ring-1 focus:ring-[#DB021D] transition-colors"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                          <X className="w-3.5 h-3.5 text-[#6B7280]" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mobile search bar (separate row) */}
                  <div className="sm:hidden mb-3 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher le numéro d'article ou le nom du produit"
                      className="w-full h-9 pl-8 pr-8 bg-[#F5F5F5] rounded-lg text-[12px] text-[#1A1A1A] placeholder:text-[#6B7280] outline-none focus:ring-1 focus:ring-[#DB021D] transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-3.5 h-3.5 text-[#6B7280]" />
                      </button>
                    )}
                  </div>

                  {/* Inserts grid — 2-column card layout like Milwaukee */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredInserts.map((insert) => {
                      const config = getDrawerConfig(activeDrawer)
                      const canAdd = canFitInDrawer(config.totalSize, insert.size)

                      return (
                        <div
                          key={insert.id}
                          className={`rounded-lg border overflow-hidden transition-all duration-200 ${
                            canAdd
                              ? 'border-gray-200 hover:border-[#DB021D] hover:shadow-md bg-white'
                              : 'border-gray-100 bg-gray-50 opacity-40'
                          }`}
                        >
                          {/* Product image */}
                          <div className="relative aspect-square bg-[#F5F5F5] p-2">
                            <Image
                              src={insert.image}
                              alt={insert.name}
                              fill
                              className="object-contain p-2"
                              unoptimized
                            />
                            {/* Size badge */}
                            <span
                              className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                insert.size === '3/3'
                                  ? 'bg-[#DB021D] text-white'
                                  : insert.size === '2/3'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-[#1A1A1A] text-white'
                              }`}
                            >
                              {insert.size}
                            </span>
                          </div>
                          {/* Product info & add button */}
                          <div className="p-2.5">
                            <p className="text-[11px] font-bold text-[#1A1A1A] leading-tight line-clamp-3 uppercase min-h-[36px]">
                              {insert.name}
                            </p>
                            <button
                              onClick={() => canAdd && addInsertToDrawer(insert)}
                              disabled={!canAdd}
                              className={`w-full h-9 mt-2 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-colors ${
                                canAdd
                                  ? 'bg-[#DB021D] hover:bg-[#B8011A] text-white'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              Ajouter au tiroir
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {filteredInserts.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-[13px] text-[#6B7280]">
                        Aucun insert trouvé pour cette recherche
                      </p>
                    </div>
                  )}
                </>
              )}

              {drawerFullFeedback !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center"
                >
                  <p className="text-[12px] font-semibold text-emerald-700">
                    {drawerLabel(drawerFullFeedback)} complet ! Passage au tiroir suivant...
                  </p>
                </motion.div>
              )}

              {getDrawerConfig(activeDrawer).totalSize >= 3 && drawerFullFeedback === null && (
                <div className="text-center py-8 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-[13px] font-semibold text-emerald-700">
                    Ce tiroir est complet !
                  </p>
                  <p className="text-[11px] text-[#6B7280] mt-1">
                    Sélectionnez un autre tiroir ou consultez le résumé
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#F5F5F5] rounded-full flex items-center justify-center">
                <ArrowLeft className="w-6 h-6 text-[#6B7280]" />
              </div>
              <h3
                className="text-[18px] font-bold text-[#1A1A1A] mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Personnalisez vos tiroirs
              </h3>
              <p className="text-[13px] text-[#6B7280] max-w-sm mx-auto">
                Cliquez sur un tiroir pour commencer à ajouter des inserts
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile fixed bottom bar with drawer nav + summary */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-3 space-y-2">
        {activeDrawer !== null && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveDrawer(Math.max(1, activeDrawer - 1))}
              disabled={activeDrawer <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-[#F5F5F5] disabled:opacity-30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#1A1A1A] uppercase">
                {drawerLabel(activeDrawer)}
              </span>
              <DrawerCapacityBar config={getDrawerConfig(activeDrawer)} />
            </div>
            <button
              onClick={() => setActiveDrawer(Math.min(totalDrawers, activeDrawer + 1))}
              disabled={activeDrawer >= totalDrawers}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-[#F5F5F5] disabled:opacity-30"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <button
          onClick={onNext}
          className="w-full h-11 bg-[#DB021D] hover:bg-[#B8011A] text-white text-[12px] font-bold rounded-lg transition-colors uppercase tracking-wide"
        >
          Voir le résumé
        </button>
      </div>
    </div>
  )
}

// ─── Step 4: Summary ────────────────────────────────────────────────────────

function generatePDF(
  cabinet: Cabinet,
  topChest: TopChest | null,
  drawerConfigs: Map<number, DrawerConfig>,
  totalConfiguredDrawers: number,
  allInserts: { drawer: number; insert: Insert }[],
) {
  // Sanitize Unicode chars unsupported by Helvetica (jsPDF built-in font)
  const sanitize = (str: string) =>
    str
      .replace(/\u2033/g, '"')  // ″ → "
      .replace(/\u2032/g, "'") // ′ → '
      .replace(/\u2019/g, "'") // ' → '
      .replace(/\u2018/g, "'") // ' → '
      .replace(/\u201C/g, '"') // " → "
      .replace(/\u201D/g, '"') // " → "
      .replace(/\u00B7/g, '·') // keep middle dot
      .replace(/\u2013/g, '-') // – → -
      .replace(/\u2014/g, '-') // — → -
      .replace(/\u2122/g, '(TM)') // ™ → (TM)

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = 20

  // ─── Header ───
  doc.setFillColor(219, 2, 29) // #DB021D
  doc.rect(0, 0, pageWidth, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('SHOP FELTEN', margin, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Revendeur Autorisé Milwaukee — Luxembourg', margin, 26)
  doc.setFontSize(9)
  doc.text('felten.lu  |  +352 621 304 952  |  florian@felten.lu', margin, 33)

  y = 52

  // ─── Title ───
  doc.setTextColor(26, 26, 26) // #1A1A1A
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('RÉSUMÉ DE VOTRE CONFIGURATION', margin, y)
  y += 4

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128) // #6B7280
  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  doc.text(`Généré le ${date}`, margin, y + 5)
  y += 14

  // ─── Servante ───
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 22, 2, 2, 'F')
  doc.setTextColor(219, 2, 29)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('SERVANTE', margin + 5, y + 7)
  doc.setTextColor(26, 26, 26)
  doc.setFontSize(11)
  doc.text(sanitize(cabinet.name), margin + 5, y + 14)
  doc.setTextColor(107, 114, 128)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const cabinetInfo = sanitize(`${cabinet.drawers} tiroirs · ${cabinet.width} · ${cabinet.color === 'red' ? 'Rouge' : 'Noir'}`)
  doc.text(cabinetInfo, margin + 5, y + 19)
  y += 28

  // ─── Coffre supérieur ───
  if (topChest) {
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 2, 2, 'F')
    doc.setTextColor(219, 2, 29)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('COFFRE SUPÉRIEUR', margin + 5, y + 7)
    doc.setTextColor(26, 26, 26)
    doc.setFontSize(11)
    doc.text(sanitize(topChest.name), margin + 5, y + 14)
    y += 24
  }

  // ─── Stats ───
  const statsY = y
  const statsW = (pageWidth - 2 * margin - 6) / 3
  const stats = [
    { value: String(allInserts.length), label: 'Inserts total' },
    { value: String(totalConfiguredDrawers), label: 'Tiroirs configurés' },
    {
      value: `${totalConfiguredDrawers}/${cabinet.configurableDrawers + (topChest?.drawers ?? 0)}`,
      label: 'Taux config.',
    },
  ]
  stats.forEach((stat, i) => {
    const x = margin + i * (statsW + 3)
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(x, statsY, statsW, 18, 2, 2, 'F')
    doc.setTextColor(219, 2, 29)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(stat.value, x + statsW / 2, statsY + 8, { align: 'center' })
    doc.setTextColor(107, 114, 128)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(stat.label.toUpperCase(), x + statsW / 2, statsY + 14, { align: 'center' })
  })
  y = statsY + 26

  // ─── Drawer details table ───
  doc.setTextColor(26, 26, 26)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DÉTAIL PAR TIROIR', margin, y)
  y += 6

  const totalDrawers = cabinet.configurableDrawers + (topChest?.drawers ?? 0)
  const tableBody: string[][] = []

  // Top chest drawers first
  if (topChest) {
    for (let i = 0; i < topChest.drawers; i++) {
      const drawerId = cabinet.configurableDrawers + i + 1
      const config = drawerConfigs.get(drawerId)
      const hasInserts = config && config.inserts.length > 0
      if (hasInserts) {
        config!.inserts.forEach((insert, idx) => {
          tableBody.push([
            idx === 0 ? `Ext. ${i + 1}` : '',
            sanitize(insert.name),
            insert.id,
            insert.size,
          ])
        })
      } else {
        tableBody.push([`Ext. ${i + 1}`, '—', '—', '—'])
      }
    }
  }

  // Cabinet drawers
  for (let i = 1; i <= cabinet.configurableDrawers; i++) {
    const config = drawerConfigs.get(i)
    const hasInserts = config && config.inserts.length > 0
    if (hasInserts) {
      config!.inserts.forEach((insert, idx) => {
        tableBody.push([
          idx === 0 ? `Tiroir ${i}` : '',
          sanitize(insert.name),
          insert.id,
          insert.size,
        ])
      })
    } else {
      tableBody.push([`Tiroir ${i}`, '—', '—', '—'])
    }
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Tiroir', 'Insert', 'Réf.', 'Taille']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [26, 26, 26],
    },
    columnStyles: {
      0: { cellWidth: 25, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 30 },
      3: { cellWidth: 18, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.cell.text[0] === '—') {
        data.cell.styles.textColor = [180, 180, 180]
        data.cell.styles.fontStyle = 'italic'
      }
    },
  })

  // ─── Footer ───
  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    const footerY = doc.internal.pageSize.getHeight() - 10
    doc.setFillColor(245, 245, 245)
    doc.rect(0, footerY - 5, pageWidth, 15, 'F')
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'normal')
    doc.text(
      'Shop Felten — Revendeur Autorisé Milwaukee — felten.lu',
      margin,
      footerY,
    )
    doc.text(
      `Page ${p}/${pageCount}`,
      pageWidth - margin,
      footerY,
      { align: 'right' },
    )
  }

  // ─── Save ───
  const cabinetSlug = cabinet.name.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').toLowerCase()
  doc.save(`configuration-servante-${cabinetSlug}.pdf`)
}

function StepSummary({
  cabinet,
  topChest,
  drawerConfigs,
  totalConfiguredDrawers,
  allInserts,
  onRestart,
  onEditDrawers,
}: {
  cabinet: Cabinet
  topChest: TopChest | null
  drawerConfigs: Map<number, DrawerConfig>
  totalConfiguredDrawers: number
  allInserts: { drawer: number; insert: Insert }[]
  onRestart: () => void
  onEditDrawers: () => void
}) {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2
          className="text-[22px] sm:text-[28px] font-black uppercase text-[#1A1A1A] leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Résumé de votre configuration
        </h2>
      </div>

      {/* Cabinet summary */}
      <div className="bg-[#F5F5F5] rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={cabinet.image}
              alt={cabinet.name}
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>
          <div>
            <p className="text-[11px] uppercase font-semibold text-[#DB021D]">Servante</p>
            <h3 className="text-[14px] font-bold text-[#1A1A1A] leading-tight">
              {cabinet.name}
            </h3>
            <p className="text-[11px] text-[#6B7280] mt-0.5">
              {cabinet.drawers} tiroirs &middot; {cabinet.width} &middot;{' '}
              {cabinet.color === 'red' ? 'Rouge' : 'Noir'}
            </p>
          </div>
        </div>
      </div>

      {/* Top chest */}
      {topChest && (
        <div className="bg-[#F5F5F5] rounded-lg p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={topChest.image}
                alt={topChest.name}
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
            <div>
              <p className="text-[11px] uppercase font-semibold text-[#DB021D]">
                Coffre supérieur
              </p>
              <h3 className="text-[14px] font-bold text-[#1A1A1A] leading-tight">
                {topChest.name}
              </h3>
              <p className="text-[11px] text-[#6B7280] mt-0.5">Réf: {topChest.ref}</p>
            </div>
          </div>
        </div>
      )}

      {/* Drawer configs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-bold text-[#1A1A1A]">
            Configuration des tiroirs
          </h3>
          <span className="text-[11px] text-[#6B7280]">
            {totalConfiguredDrawers}/{cabinet.configurableDrawers + (topChest?.drawers ?? 0)} configurés
          </span>
        </div>

        <div className="space-y-2">
          {/* Top chest drawers */}
          {topChest && topChest.drawers > 0 && (
            <>
              <p className="text-[10px] uppercase font-semibold text-[#6B7280] tracking-wider mt-2">
                Coffre supérieur
              </p>
              {Array.from({ length: topChest.drawers }, (_, i) => {
                const drawerId = cabinet.configurableDrawers + i + 1
                const config = drawerConfigs.get(drawerId)
                const hasInserts = config && config.inserts.length > 0
                return (
                  <div key={`ext-${drawerId}`} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className={`flex items-center justify-between px-4 py-3 ${hasInserts ? 'bg-white' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-bold text-[#1A1A1A] uppercase">
                          Extension {i + 1}
                        </span>
                        {hasInserts && (
                          <span className="text-[10px] text-[#6B7280]">
                            {config!.inserts.length} insert{config!.inserts.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {hasInserts ? (
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((slot) => (
                            <div key={slot} className={`w-3 h-2 rounded-sm ${slot <= config!.totalSize ? 'bg-[#DB021D]' : 'bg-gray-200'}`} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#6B7280] italic">Vide</span>
                      )}
                    </div>
                    {hasInserts && (
                      <div className="px-4 pb-3 space-y-1.5">
                        {config!.inserts.map((insert, idx) => (
                          <div key={`${insert.id}-${idx}`} className="flex items-center gap-2 text-[11px]">
                            <div className="relative w-8 h-8 bg-[#F5F5F5] rounded overflow-hidden flex-shrink-0">
                              <Image src={insert.image} alt={insert.name} fill className="object-contain" unoptimized />
                            </div>
                            <span className="flex-1 text-[#1A1A1A] truncate">{insert.name}</span>
                            <SizeBadge size={insert.size} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <p className="text-[10px] uppercase font-semibold text-[#6B7280] tracking-wider mt-3">
                Servante
              </p>
            </>
          )}
          {/* Cabinet drawers */}
          {Array.from({ length: cabinet.configurableDrawers }, (_, i) => {
            const drawerId = i + 1
            const config = drawerConfigs.get(drawerId)
            const hasInserts = config && config.inserts.length > 0

            return (
              <div key={drawerId} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className={`flex items-center justify-between px-4 py-3 ${
                    hasInserts ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-[#1A1A1A] uppercase">
                      Tiroir {drawerId}
                    </span>
                    {hasInserts && (
                      <span className="text-[10px] text-[#6B7280]">
                        {config!.inserts.length} insert{config!.inserts.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {hasInserts ? (
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((slot) => (
                        <div
                          key={slot}
                          className={`w-3 h-2 rounded-sm ${
                            slot <= config!.totalSize ? 'bg-[#DB021D]' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#6B7280] italic">Vide</span>
                  )}
                </div>

                {hasInserts && (
                  <div className="px-4 pb-3 space-y-1.5">
                    {config!.inserts.map((insert, idx) => (
                      <div
                        key={`${insert.id}-${idx}`}
                        className="flex items-center gap-2 text-[11px]"
                      >
                        <div className="relative w-8 h-8 bg-[#F5F5F5] rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={insert.image}
                            alt={insert.name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <span className="flex-1 text-[#1A1A1A] truncate">{insert.name}</span>
                        <SizeBadge size={insert.size} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#F5F5F5] rounded-lg p-4 text-center">
          <p className="text-[24px] font-black text-[#DB021D]">{allInserts.length}</p>
          <p className="text-[11px] text-[#6B7280] font-semibold uppercase">Inserts total</p>
        </div>
        <div className="bg-[#F5F5F5] rounded-lg p-4 text-center">
          <p className="text-[24px] font-black text-[#DB021D]">{totalConfiguredDrawers}</p>
          <p className="text-[11px] text-[#6B7280] font-semibold uppercase">
            Tiroirs configurés
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() =>
            generatePDF(cabinet, topChest, drawerConfigs, totalConfiguredDrawers, allInserts)
          }
          className="w-full h-12 bg-[#DB021D] hover:bg-[#B8011A] text-white text-[13px] font-black rounded-lg transition-colors uppercase tracking-wide flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Télécharger le PDF
        </button>
        <button
          onClick={onEditDrawers}
          className="w-full h-11 bg-[#1A1A1A] hover:bg-[#2D2D2D] text-white text-[13px] font-semibold rounded-lg transition-colors uppercase tracking-wide flex items-center justify-center gap-2"
        >
          Modifier les tiroirs
        </button>
        <button
          onClick={onRestart}
          className="w-full h-11 border border-gray-200 hover:border-gray-300 text-[#1A1A1A] text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Recommencer
        </button>
      </div>

      {/* Contact CTA */}
      <div className="mt-8 p-5 bg-[#1A1A1A] rounded-lg text-center">
        <h3
          className="text-[16px] font-black text-white uppercase mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Intéressé par cette configuration ?
        </h3>
        <p className="text-[12px] text-gray-400 mb-4">
          Contactez-nous pour obtenir un devis personnalisé
        </p>
        <a
          href="https://wa.me/352661123456?text=Bonjour%2C%20je%20souhaite%20un%20devis%20pour%20une%20configuration%20de%20servante%20Milwaukee"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-11 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[13px] font-semibold rounded-lg transition-colors"
        >
          Nous contacter via WhatsApp
        </a>
      </div>
    </div>
  )
}

// ─── Shared Components ──────────────────────────────────────────────────────

function DrawerButton({
  drawerId,
  label,
  activeDrawer,
  setActiveDrawer,
  getDrawerConfig,
}: {
  drawerId: number
  label: string
  activeDrawer: number | null
  setActiveDrawer: (d: number | null) => void
  getDrawerConfig: (d: number) => DrawerConfig
}) {
  const config = getDrawerConfig(drawerId)
  const isActive = activeDrawer === drawerId
  const hasInserts = config.inserts.length > 0
  const isFull = config.totalSize >= 3

  return (
    <button
      onClick={() => setActiveDrawer(isActive ? null : drawerId)}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left transition-all duration-200 ${
        isActive
          ? 'bg-[#DB021D] text-white shadow-md'
          : hasInserts
            ? 'bg-white border border-gray-200 text-[#1A1A1A] hover:border-[#DB021D]'
            : 'bg-white border border-gray-200 text-[#6B7280] hover:border-gray-300'
      }`}
    >
      <span className="text-[12px] font-bold uppercase">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3].map((slot) => (
            <div
              key={slot}
              className={`w-3 h-2 rounded-sm ${
                slot <= config.totalSize
                  ? isActive ? 'bg-white/80' : 'bg-[#DB021D]'
                  : isActive ? 'bg-white/20' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        {isFull && !isActive && <Check className="w-3.5 h-3.5 text-emerald-500" />}
      </div>
    </button>
  )
}

function SizeBadge({ size }: { size: string }) {
  return (
    <span
      className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
        size === '3/3'
          ? 'bg-[#DB021D]/10 text-[#DB021D]'
          : size === '2/3'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-blue-50 text-blue-600'
      }`}
    >
      {size}
    </span>
  )
}

function DrawerCapacityBar({ config }: { config: DrawerConfig }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3].map((slot) => (
          <div
            key={slot}
            className={`w-5 h-3 rounded-sm transition-colors ${
              slot <= config.totalSize ? 'bg-[#DB021D]' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <span className="text-[11px] font-semibold text-[#6B7280]">
        {config.totalSize}/3
      </span>
    </div>
  )
}
