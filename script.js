const projectGrid = document.getElementById('project-grid');
const filterBar = document.getElementById('filter-bar');
const searchInput = document.getElementById('project-search');
const noResults = document.getElementById('no-results');
const languagesChart = document.getElementById('languages-chart');

const projects = window.PORTFOLIO_PROJECTS || [];
const categories = ['Tous', ...new Set(projects.map(project => project.category))];
let activeCategory = 'Tous';
let searchTerm = '';

function collectLanguageCounts() {
  const counts = {};
  projects.forEach(project => {
    (project.languages || []).forEach(language => {
      const normalized = language.trim();
      if (!normalized) return;
      counts[normalized] = (counts[normalized] || 0) + 1;
    });
  });
  return counts;
}

function getTopLanguages(limit = 5) {
  const counts = collectLanguageCounts();
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function initLanguagesChart() {
  if (!languagesChart) return;
  languagesChart.innerHTML = '';

  const totalProjects = projects.length;
  const languageCounts = collectLanguageCounts();
  const topLanguages = getTopLanguages(5);

  topLanguages.forEach(lang => {
    const item = document.createElement('div');
    item.className = 'language-item';
    const percentage = totalProjects ? Math.round((lang.count / totalProjects) * 100) : 0;

    item.innerHTML = `
      <span class="language-label">${lang.name}</span>
      <div class="language-bar-container">
        <div class="language-bar" style="width: ${percentage}%"></div>
      </div>
      <span class="language-percentage">${percentage}%</span>
    `;
    languagesChart.appendChild(item);

    const bar = item.querySelector('.language-bar');
    const percentageSpan = item.querySelector('.language-percentage');

    bar.addEventListener('mouseenter', () => {
      percentageSpan.textContent = `${lang.count}/${totalProjects}`;
    });

    bar.addEventListener('mouseleave', () => {
      percentageSpan.textContent = `${percentage}%`;
    });
  });

  document.getElementById('projects-count').textContent = totalProjects;
  document.getElementById('languages-count').textContent = Object.keys(languageCounts).length;
}

function createFilterButtons() {
  categories.forEach(category => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = category;
    button.className = 'filter-button';
    if (category === activeCategory) button.classList.add('active');
    button.addEventListener('click', () => {
      activeCategory = category;
      updateFilters();
    });
    filterBar.appendChild(button);
  });
}

function matchesSearch(project) {
  if (!searchTerm.trim()) return true;
  const query = searchTerm.toLowerCase();
  return [project.title, project.category, project.description, project.subtitle, project.linkLabel]
    .filter(Boolean)
    .some(value => value.toLowerCase().includes(query))
    || project.tags.some(tag => tag.toLowerCase().includes(query))
    || (project.languages || []).some(language => language.toLowerCase().includes(query));
}

function matchesCategory(project) {
  return activeCategory === 'Tous' || project.category === activeCategory;
}

function renderProjects() {
  projectGrid.innerHTML = '';
  const filtered = projects.filter(project => matchesCategory(project) && matchesSearch(project));

  if (!filtered.length) {
    noResults.style.opacity = '1';
    return;
  }

  noResults.style.opacity = '0';

  filtered.forEach(project => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.innerHTML = `
      <img src="${project.image}" alt="${project.title}" loading="lazy" />
      <div class="project-content">
        <div class="project-meta">
          <span>${project.category}</span>
          <span>${project.status}</span>
        </div>
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="language-list">
          ${ (project.languages || []).map(language => `<span class="language-chip">${language}</span>`).join('') }
        </div>
        <div class="tag-list">
          ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <a class="project-action" href="${project.link}" target="_blank" rel="noreferrer">
          ${project.linkLabel}
        </a>
      </div>
    `;
    projectGrid.appendChild(card);
  });
}

function updateFilters() {
  const filterButtons = filterBar.querySelectorAll('.filter-button');
  filterButtons.forEach(button => {
    button.classList.toggle('active', button.textContent === activeCategory);
  });
  renderProjects();
}

searchInput.addEventListener('input', event => {
  searchTerm = event.target.value;
  renderProjects();
});

initLanguagesChart();
createFilterButtons();
renderProjects();
