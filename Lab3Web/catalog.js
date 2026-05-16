const API_URL = 'http://localhost:3000';

let servicesData = [];
let currentData = [];
const container = document.getElementById('services-container');

function renderCards(data) {
    container.innerHTML = '';
    if (data.length === 0) {
        container.innerHTML = '<div class="no-results">No services found for your criteria.</div>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
            <div class="service-image"><img src="${item.img}" alt="${item.name}"></div>
            <div class="service-footer">
                <h4>IPDC ${item.name}<br><small style="font-size:12px; color:#ed017f">${item.category} | ${item.rate}%</small></h4>
                <img class="arrow-btn" src="public/Arrow Circle Right (1).svg">
            </div>
            <p style="padding: 10px 0; color: #999;">${item.desc}</p>
        `;
        container.appendChild(card);
    });
}

function setupMethodButtons() {
    const methods = [
        { label: "Filter: Retail",   func: () => currentData = servicesData.filter(i => i.category === "Retail") },
        { label: "Filter: Popular",  func: () => currentData = servicesData.filter(i => i.popular) },
        { label: "Sort: Low Rate",   func: () => currentData = [...servicesData].sort((a, b) => a.rate - b.rate) },
        { label: "Map: Promo Info",  func: () => {
            currentData = servicesData.map(i => ({
                ...i,
                name: i.name.toUpperCase(),
                desc: '🔥 PROMO: ' + i.desc
            }));
        }},
        { label: "Find: High Rate",  func: () => {
            const found = servicesData.find(i => i.rate > 13);
            currentData = found ? [found] : [];
        }},
        { label: "Reduce: Avg Rate", func: () => {
            const avg = servicesData.reduce((acc, i) => acc + i.rate, 0) / servicesData.length;
            currentData = servicesData
                .filter(i => i.rate > avg)
                .map(i => ({ ...i, desc: `📊 Above avg (${avg.toFixed(1)}%): ${i.desc}` }));
        }},
        { label: "Some: Above 10%",  func: () => {
            currentData = servicesData.filter(i => i.rate > 10);
        }},
        { label: "Every: Low Rate?", func: () => {
            currentData = servicesData.filter(i => i.rate > 3);
        }},
        { label: "Slice: First 5",   func: () => currentData = servicesData.slice(5, 10) },
        { label: "Reset Catalog",    func: () => currentData = [...servicesData] }
    ];

    const buttonsDiv = document.getElementById('methodsButtons');
    methods.forEach(m => {
        const btn = document.createElement('button');
        btn.className = 'btn-pink';
        btn.style = "width: auto; height: 35px; font-size: 10px;";
        btn.innerText = m.label;
        btn.onclick = () => { m.func(); renderCards(currentData); };
        buttonsDiv.appendChild(btn);
    });
}

function setupSearch() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = servicesData.filter(item =>
            item.name.toLowerCase().includes(term) ||
            item.desc.toLowerCase().includes(term)
        );
        renderCards(filtered);
    });
}

function setupSort() {
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        const val = e.target.value;
        let sorted = [...currentData];
        if (val === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
        if (val === 'rate') sorted.sort((a, b) => a.rate - b.rate);
        renderCards(sorted);
    });
}

async function init() {
    try {
        const res = await fetch(`${API_URL}/services`);
        servicesData = await res.json();
        currentData = [...servicesData];
        renderCards(servicesData);
        setupMethodButtons();
        setupSearch();
        setupSort();
    } catch (err) {
        container.innerHTML = '<div class="no-results">Could not connect to server. Make sure JSON Server is running: <b>npm run server</b></div>';
        console.error('JSON Server error:', err);
    }
}

init();
