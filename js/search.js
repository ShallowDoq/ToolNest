function initSearch(){const input=document.getElementById('toolSearch');input.addEventListener('input',()=>filterTools(input.value));}
function filterTools(query){const q=query.trim().toLowerCase();let shown=0;document.querySelectorAll('.tool-card').forEach(card=>{const ok=card.dataset.search.includes(q);card.hidden=!ok;if(ok)shown++;});document.getElementById('noResults').hidden=shown!==0;}
