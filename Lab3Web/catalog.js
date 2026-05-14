const servicesData = [
    { id: 1, name: "Personal Loan", category: "Retail", rate: 9.5, desc: "Quick cash for personal needs", img: "public/service2.png", popular: true },
    { id: 2, name: "Home Loan", category: "Retail", rate: 7.5, desc: "Build your dream house today", img: "public/service1.png", popular: true },
    { id: 3, name: "Auto Loan", category: "Retail", rate: 8.0, desc: "Get your favorite car easily", img: "public/service4.png", popular: false },
    { id: 4, name: "SME Business", category: "SME", rate: 11.0, desc: "Empowering small businesses", img: "public/service3.png", popular: true },
    { id: 5, name: "Fixed Deposit", category: "Savings", rate: 6.5, desc: "Secure growth for your money", img: "public/service1.png", popular: false },
    { id: 6, name: "Hajj Deposit", category: "Savings", rate: 5.0, desc: "Save for your sacred journey", img: "public/service3.png", popular: false },
    { id: 7, name: "Corporate Finance", category: "Corporate", rate: 12.0, desc: "Large scale capital solutions", img: "public/service2.png", popular: true },
    { id: 8, name: "Women Entrepreneur", category: "SME", rate: 8.5, desc: "Special support for women", img: "public/service4.png", popular: true },
    { id: 9, name: "Education Loan", category: "Retail", rate: 7.0, desc: "Invest in your future knowledge", img: "public/service1.png", popular: false },
    { id: 10, name: "Green Banking", category: "Corporate", rate: 6.0, desc: "Eco-friendly financial projects", img: "public/service2.png", popular: false },
    { id: 11, name: "Digital Savings", category: "Savings", rate: 4.5, desc: "Instant mobile bank account", img: "public/service3.png", popular: true },
    { id: 12, name: "Marriage Loan", category: "Retail", rate: 10.0, desc: "Make your big day special", img: "public/service4.png", popular: false },
    { id: 13, name: "Agro Loan", category: "SME", rate: 7.0, desc: "Support for modern farming", img: "public/service2.png", popular: false },
    { id: 14, name: "Millionaire Scheme", category: "Savings", rate: 8.2, desc: "Long term wealth building", img: "public/service1.png", popular: true },
    { id: 15, name: "Bridge Finance", category: "Corporate", rate: 13.5, desc: "Short term gap funding", img: "public/service3.png", popular: false }
];

let currentData = [...servicesData];
const container = document.getElementById('services-container');

function renderCards(data) {
    container.innerHTML = '';
    if (data.length === 0) {
        container.innerHTML = '<div class="no-results">No services found for your criteria.</div>'; // [cite: 85]
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

const methods = [
    { label: "Filter: Retail", func: () => currentData = servicesData.filter(i => i.category === "Retail") },
    { label: "Filter: Popular", func: () => currentData = servicesData.filter(i => i.popular) },
    { label: "Sort: Low Rate", func: () => currentData = [...servicesData].sort((a, b) => a.rate - b.rate) },
    { label: "Map: Promo Info", func: () => {
        alert("Names mapped to uppercase in console");
        console.log(servicesData.map(i => i.name.toUpperCase()));
    }},
    { label: "Find: High Rate", func: () => {
        const found = servicesData.find(i => i.rate > 13);
        alert(`Found: ${found ? found.name : 'None'}`);
    }},
    { label: "Reduce: Avg Rate", func: () => {
        const avg = servicesData.reduce((acc, i) => acc + i.rate, 0) / servicesData.length;
        alert(`Average Interest Rate: ${avg.toFixed(2)}%`);
    }},
    { label: "Some: Above 10%", func: () => alert(`Any > 10%? ${servicesData.some(i => i.rate > 10)}`) },
    { label: "Every: Low Rate?", func: () => alert(`All > 3%? ${servicesData.every(i => i.rate > 3)}`) },
    { label: "Slice: First 5", func: () => currentData = servicesData.slice(0, 5) },
    { label: "Reset Catalog", func: () => currentData = [...servicesData] }
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

document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = servicesData.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.desc.toLowerCase().includes(term)
    );
    renderCards(filtered);
});

document.getElementById('sortSelect').addEventListener('change', (e) => {
    const val = e.target.value;
    let sorted = [...currentData];
    if (val === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (val === 'rate') sorted.sort((a, b) => a.rate - b.rate);
    renderCards(sorted);
});

renderCards(servicesData);