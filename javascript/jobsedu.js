
document.addEventListener("DOMContentLoaded",function(){
fetch("../data.json")//read json
.then(hold=> hold.json()) //unlock w 22raha
.then(data => //23ml b 2l data kaza
{

 const readparam = new URLSearchParams(window.location.search); //hat 7tt ? f 2l url
 const id = parseInt(readparam.get("id")); //hat value 2l id w 7wloh int
 const user = data.users.find(u=>u.id === id);



if (user.education)
{
 const educ=document.getElementById("education")
     Object.entries(user.education).forEach(([edu,period])=>
     {
      const pair=document.createElement("div");
      pair.className='tag-pair';

      const left=document.createElement("div");
      left.className='tag-left';
      left.textContent=edu;

       const right=document.createElement("div");
      right.className='tag-right';
      right.textContent=period;
 
    pair.appendChild(left);
    pair.appendChild(right);
    educ.appendChild(pair);
     
     });

}



 if (user.jobs)
 {
  const jobie=document.getElementById("jobs")
   Object.entries(user.jobs).forEach(([company, period]) => {
  const pair = document.createElement('div');
  pair.className = 'tag-pair';
  
  const left = document.createElement('div');
  left.className = 'tag-left';
  left.textContent = company;
  



  const right = document.createElement('div');
  right.className = 'tag-right';
  right.textContent = period;
  
  pair.appendChild(left);
  pair.appendChild(right);
 jobie.appendChild(pair);
       });
 }


if (user.certificates) 
  {

  let certContainer = document.getElementById("certificates");

  user.certificates.forEach(cert => {
    const card = document.createElement("div");
    card.className = "certificate-item";
    

    const img = document.createElement("img");
    img.src = cert.image;
    img.alt = "Certificate";
    img.className = "cert-image";
    const overlay = document.getElementById("certOverlay");
const zoomed = document.getElementById("certZoomed");

img.style.cursor = "pointer";
img.addEventListener("click", () => {
  zoomed.src = cert.image;
  overlay.classList.add("active");
});

overlay.addEventListener("click", () => {
  overlay.classList.remove("active");
});

    const desc = document.createElement("p");
    desc.className = "cert-description";
    desc.textContent = cert.description;
    
    card.appendChild(img);
    card.appendChild(desc);
    certContainer.appendChild(card);

  });
}


if (user.rating)
{
 const rat=document.getElementById("rating")

    rat.textContent=user.rating;
    ratcont.appendChild(rat);

}
 const rating = parseFloat(user.rating);

const stars = document.getElementById("star");

 let loopr=rating;
for (let i = 1; i <= 5; i++) {
  const star = document.createElement("span");
  star.classList.add("star");

  if (loopr >= 1 ) {
  
    star.innerHTML = `<svg xmlns="http://w3.org" viewBox="0 0 24 24" width="40" height="40" fill="#fecd6d" stroke="#fecd6d" stroke-width="1" stroke-linejoin="round">
  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
</svg>`;
loopr --;
  
  } 
  else if (loopr == 0.5 ) {
  
    star.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" stroke="#fecd6d" stroke-width="2">
      <defs>
        <linearGradient id="half">
          <stop offset="50%" stop-color="#fecd6d"/>
          <stop offset="50%" stop-color="transparent"/>
        </linearGradient>
      </defs>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#half)"/>
    </svg>`;
     loopr=0;
  } 
   else if (loopr > 0.5 ) {
  
    star.innerHTML =`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" stroke="#fecd6d" stroke-width="2">
      <defs>
        <linearGradient id="moreh">
          <stop offset="60%" stop-color="#fecd6d"/>
          <stop offset="60%" stop-color="transparent"/>
        </linearGradient>
      </defs>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#moreh)"/>
    </svg>`;
 loopr=0;
    
  } 

   else if (loopr < 0.5  && loopr!=0) {
  
   star.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" stroke="#fecd6d" stroke-width="2">
      <defs>
        <linearGradient id="lessh">
          <stop offset="34%" stop-color="#fecd6d"/>
          <stop offset="34%" stop-color="transparent"/>
        </linearGradient>
      </defs>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#lessh)"/>
    </svg>`;
   loopr =0;
    
  } 
  else  {

    star.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fecd6d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
</svg>
`;
  }

  stars.appendChild(star);
  ratcont.appendChild(stars);
}

let num =0;
const plop = document.getElementById("listcard");
const fornum = document.getElementById("connectedw");
const numd = document.getElementById("numb");
 numd.textContent=num;
  
   
   user.connected.forEach(  w=>
{
   num++;
})
numd.textContent=num;
   
user.connected.forEach(  w=>
{
   // fetch user and display its name as a link
  //w is id

   const frnd = data.users.find(u=>u.id === w);
   if (frnd)
   {

   const link = document.createElement("a")
   link.href="../html/profile.html?id="+ w ;
   link.classList.add("frndcss");
   link.textContent=frnd.firstname + " " +frnd.lastname;
   plop.appendChild(link);
  
   }
}
    
)
  
  document.getElementById("listcard").classList.add("hide");
document.getElementById("connectedw").addEventListener("click", () => {
  document.getElementById("listcard").classList.toggle("hide");
  







});



})








.catch(err=>console.error("fetch failed: ",err));








}



);

