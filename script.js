const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const addBtn = document.getElementById("addExpense");
const expenseList = document.getElementById("expenseList");
const totalText = document.getElementById("total");
const topCategoryText = document.getElementById("topCategory");
const last7Text = document.getElementById("last7Days");
const barCanvas = document.getElementById("barChart").getContext("2d");

const authBtn = document.getElementById("authBtn");
const authModal = document.getElementById("authModal");
const authClose = document.getElementById("authClose");
const authTitle = document.getElementById("authTitle");
const authSubmit = document.getElementById("authSubmit");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const switchAuth = document.getElementById("switchAuth");
const modeToggle = document.getElementById("modeToggle");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
let currentUser = localStorage.getItem("currentUser") || null;
let isLogin = true;

// Dark/Light mode
modeToggle.addEventListener("click",()=>{
  document.body.classList.toggle("light-mode");
  document.body.classList.toggle("dark-mode");
});

// Auth modal
authBtn.addEventListener("click",()=> authModal.style.display="flex");
authClose.addEventListener("click",()=> authModal.style.display="none");
switchAuth.addEventListener("click",()=>{
  isLogin=!isLogin;
  authTitle.textContent=isLogin?"Login":"Sign Up";
  switchAuth.textContent=isLogin?"Don't have an account? Sign Up":"Already have an account? Login";
});

// Auth submit
authSubmit.addEventListener("click",()=>{
  const user=usernameInput.value.trim();
  const pass=passwordInput.value.trim();
  if(user && pass){
    if(isLogin){
      const acc=accounts.find(a=>a.username===user && a.password===pass);
      if(acc){ currentUser=user; localStorage.setItem("currentUser",currentUser); alert("Logged in!"); authModal.style.display="none"; render(); }
      else alert("Invalid credentials");
    } else{
      if(accounts.find(a=>a.username===user)){ alert("User exists"); }
      else{ accounts.push({username:user,password:pass}); localStorage.setItem("accounts",JSON.stringify(accounts)); alert("Account created!"); isLogin=true; authModal.style.display="none"; }
    }
  }
});

// Add Expense
addBtn.addEventListener("click",()=>{
  if(!currentUser){ alert("Please login"); return; }
  const title=titleInput.value.trim();
  const amount=parseFloat(amountInput.value);
  if(title && amount>0){
    expenses.push({user:currentUser,title,amount,category:categoryInput.value,date:new Date()});
    localStorage.setItem("expenses",JSON.stringify(expenses));
    titleInput.value=""; amountInput.value="";
    render();
  }
});

// Render expenses
function render(){
  if(!currentUser){ totalText.textContent="₹0"; topCategoryText.textContent="-"; last7Text.textContent="₹0"; expenseList.innerHTML=""; return; }
  const userExpenses=expenses.filter(e=>e.user===currentUser);
  // Total
  let total=0;
  let last7=0;
  const categories={};
  const today=new Date();
  expenseList.innerHTML="";
  userExpenses.forEach((e,i)=>{
    total+=e.amount;
    const expDate=new Date(e.date);
    if((today-expDate)/(1000*60*60*24)<=7) last7+=e.amount;
    categories[e.category]=(categories[e.category]||0)+e.amount;
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${e.title}</td><td>${e.category}</td><td>₹${e.amount}</td><td><b class="delete-btn" onclick="deleteExpense(${i})">✕</b></td>`;
    expenseList.appendChild(tr);
  });
  totalText.textContent=`₹${total}`;
  last7Text.textContent=`₹${last7}`;
  topCategoryText.textContent=Object.keys(categories).length>0?Object.keys(categories).reduce((a,b)=>categories[a]>categories[b]?a:b):"-";
  drawBarChart(categories);
}

// Delete Expense
function deleteExpense(i){
  const userExpenses=expenses.filter(e=>e.user===currentUser);
  const globalIndex=expenses.indexOf(userExpenses[i]);
  expenses.splice(globalIndex,1);
  localStorage.setItem("expenses",JSON.stringify(expenses));
  render();
}

// Animated Bar Chart
function drawBarChart(categories){
  barCanvas.clearRect(0,0,400,200);
  const keys=Object.keys(categories);
  const values=Object.values(categories);
  const colors=["#6366f1","#22c55e","#f59e0b","#ef4444","#10b981"];
  const maxVal=Math.max(...values,50);
  let step=0;
  function animate(){
    step+=1;
    barCanvas.clearRect(0,0,400,200);
    keys.forEach((k,i)=>{
      const h=(values[i]/maxVal)*150*step/50;
      barCanvas.fillStyle=colors[i%colors.length];
      barCanvas.fillRect(i*60+40,150-h,40,h);
      barCanvas.fillStyle="#ffffff";
      barCanvas.fillText(k,i*60+40,160);
    });
    if(step<50) requestAnimationFrame(animate);
  }
  animate();
}

render();
