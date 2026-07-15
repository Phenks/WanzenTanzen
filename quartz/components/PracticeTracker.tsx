import { QuartzComponentConstructor } from "./types"

const script = `
const STORAGE_KEY = "wanzen-practice"

function getPracticeData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function setPracticeLevel(figureId, level) {
  const data = getPracticeData()
  data[figureId] = level
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function getFigureId() {
  return decodeURIComponent(window.location.pathname).replace(/\\//g, "-").replace(/^-|-$/g, "")
}

function isFigurePage() {
  return window.location.pathname.toLowerCase().includes("/wcs/")
}

const LABELS = {
  0: { text: "Nicht bewertet", color: "#9893a5" },
  1: { text: "Muss dringend geübt werden", color: "#eb6f92" },
  2: { text: "Noch unsicher", color: "#f6c177" },
  3: { text: "Geht so", color: "#908caa" },
  4: { text: "Gut drauf", color: "#56949f" },
  5: { text: "Sitzt!", color: "#286983" },
}

function renderSlider() {
  if (!isFigurePage()) return
  if (document.getElementById("practice-tracker")) return

  const figureId = getFigureId()
  const data = getPracticeData()
  const currentLevel = data[figureId] || 0

  const container = document.createElement("div")
  container.id = "practice-tracker"
  container.style.cssText = "margin: 1.5rem 0; padding: 1rem 1.2rem; border-radius: 8px; background: var(--light); border: 1px solid var(--lightgray); display: flex; flex-direction: column; gap: 0.6rem;"

  const label = document.createElement("div")
  label.style.cssText = "display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 600; color: var(--darkgray);"
  label.innerHTML = '<span>🎯 Übungsstand</span><span id="practice-label" style="color: ' + LABELS[currentLevel].color + '">' + LABELS[currentLevel].text + '</span>'

  const sliderRow = document.createElement("div")
  sliderRow.style.cssText = "display: flex; align-items: center; gap: 0.8rem;"

  const slider = document.createElement("input")
  slider.type = "range"
  slider.min = "1"
  slider.max = "5"
  slider.value = String(currentLevel || 1)
  slider.style.cssText = "flex: 1; accent-color: var(--secondary); cursor: pointer;"

  const stars = document.createElement("span")
  stars.id = "practice-stars"
  stars.style.cssText = "font-size: 1rem; min-width: 60px; text-align: right;"
  stars.textContent = currentLevel > 0 ? "★".repeat(currentLevel) + "☆".repeat(5 - currentLevel) : "☆☆☆☆☆"

  slider.addEventListener("input", () => {
    const level = parseInt(slider.value)
    setPracticeLevel(figureId, level)
    const practiceLabel = document.getElementById("practice-label")
    const practiceStars = document.getElementById("practice-stars")
    if (practiceLabel) {
      practiceLabel.textContent = LABELS[level].text
      practiceLabel.style.color = LABELS[level].color
    }
    if (practiceStars) {
      practiceStars.textContent = "★".repeat(level) + "☆".repeat(5 - level)
    }
  })

  sliderRow.appendChild(slider)
  sliderRow.appendChild(stars)
  container.appendChild(label)
  container.appendChild(sliderRow)

  const h1 = document.querySelector("h1")
  if (h1) {
    h1.insertAdjacentElement("afterend", container)
  }
}

function renderFilter() {
  if (isFigurePage()) return
  if (document.getElementById("practice-filter")) return

  const data = getPracticeData()
  if (Object.keys(data).length === 0) return

  const filterBar = document.createElement("div")
  filterBar.id = "practice-filter"
  filterBar.style.cssText = "margin: 1rem 0; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; font-size: 0.85rem;"

  const filterLabel = document.createElement("span")
  filterLabel.textContent = "Filter:"
  filterLabel.style.color = "var(--darkgray)"
  filterBar.appendChild(filterLabel)

  const filters = [
    { label: "Alle", value: 0 },
    { label: "⚠️ Muss geübt werden", value: 1 },
    { label: "😅 Noch unsicher", value: 2 },
    { label: "😐 Geht so", value: 3 },
    { label: "😊 Gut drauf", value: 4 },
    { label: "🌟 Sitzt!", value: 5 },
  ]

  let activeFilter = 0

  const applyFilter = (level) => {
    const items = document.querySelectorAll("ul.section-ul li, .page-listing li")
    items.forEach((item) => {
      const link = item.querySelector("a")
      if (!link) return
      try {
        const path = decodeURIComponent(new URL(link.href).pathname).replace(/\\//g, "-").replace(/^-|-$/g, "")
        const itemLevel = data[path] || 0
        item.style.display = level === 0 || itemLevel === level ? "" : "none"
      } catch {}
    })
  }

  filters.forEach((f) => {
    const btn = document.createElement("button")
    btn.textContent = f.label
    btn.dataset.value = String(f.value)
    btn.style.cssText = "padding: 0.25rem 0.7rem; border-radius: 99px; border: 1px solid var(--lightgray); background: var(--light); color: var(--darkgray); cursor: pointer; font-size: 0.8rem;"

    btn.addEventListener("click", () => {
      activeFilter = f.value
      filterBar.querySelectorAll("button").forEach((b) => {
        b.style.background = parseInt(b.dataset.value || "0") === activeFilter ? "var(--secondary)" : "var(--light)"
      })
      applyFilter(activeFilter)
    })

    filterBar.appendChild(btn)
  })

  const pageList = document.querySelector("ul.section-ul, .page-listing, article")
  if (pageList) {
    pageList.insertAdjacentElement("beforebegin", filterBar)
  }
}

function initPracticeTracker() {
  document.getElementById("practice-tracker")?.remove()
  document.getElementById("practice-filter")?.remove()
  renderSlider()
  renderFilter()
}

document.addEventListener("nav", initPracticeTracker)
document.addEventListener("render", initPracticeTracker)
initPracticeTracker()
`

const PracticeTracker = (() => {
  function PracticeTrackerComponent() {
    return <></>
  }
  PracticeTrackerComponent.afterDOMLoaded = script
  return PracticeTrackerComponent
}) satisfies QuartzComponentConstructor

export default PracticeTracker
