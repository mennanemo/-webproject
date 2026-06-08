document.addEventListener("DOMContentLoaded",function(){

    const readparam = new URLSearchParams(window.location.search);
  const id = readparam.get("id");

fetch("/api/profile/" + id)//read json
.then(hold=> hold.json()) //unlock w 22raha
.then(user => 
{
 
document.getElementById("cancel").addEventListener("click",()=>
{
   document.getElementById("cancel").href="../views/profile.html?id="+user._id;
});
 if(user.image && user.image!='')
 {
 document.getElementById("profileimg").src= user.image;
 document.getElementById("profileimg").style.cursor = "pointer";


 document.getElementById("profileimg").addEventListener("click",()=>
{
   document.getElementById("pfpinput").click();
   
})

 document.getElementById("badge").addEventListener("click",()=>
{
   document.getElementById("pfpinput").click();
   
})

 }

 document.getElementById("pfpinput").addEventListener("change", async () => {
  const file = document.getElementById("pfpinput").files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/api/profile/" + id + "/upload/pfp", {
    method: "POST",
    body: formData
  });

  const updated = await res.json();
  document.getElementById("profileimg").src = updated.image;
});



if(user.pfbg && user.pfbg!='')
{
document.getElementById("bgimage").src= user.pfbg;

document.getElementById("bgimage").addEventListener("click",()=>
{
   document.getElementById("bginput").click();
})
}

document.getElementById("bginput").addEventListener("change", async () => {
  const file = document.getElementById("bginput").files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("pfbg", file);

  const res = await fetch("/api/profile/" + id + "/upload/bg", {
    method: "POST",
    body: formData
  });

  const updated = await res.json();
  document.getElementById("bgimage").src = updated.pfbg;
});


document.getElementById("firstname").value = user.firstname || '';
document.getElementById("lastname").value = user.lastname || '';
document.getElementById("about").value = user.about || '';
 


 if (user.education && user.education.length > 0) {
        const list = document.getElementById("educationlist");
        user.education.forEach(edu => {
          const entry = document.createElement("div");
          entry.className = "education-entry";
          entry.innerHTML = `
            <input type="text" class="cssbar" placeholder="School / University" oninput="this.value = this.value.replace(/[^a-zA-Z\s]/g, '')" value="${edu.school || ''}">
            <input type="text" class="cssbar" placeholder="YYYY" maxlength="4" oninput="formatYear(this)" value="${edu.year || ''}">
            <button type="button" onclick="removeEntry(this)">Remove</button>
          `;
          list.insertBefore(entry, list.lastElementChild);
        });
      }

      if (user.experience && user.experience.length > 0) {
        const liste = document.getElementById("explist");
        user.experience.forEach(exp => {
          const entry = document.createElement("div");
          entry.className = "exp-entry";
          entry.innerHTML = `
            <input type="text" class="cssbar" placeholder="Company" oninput="this.value = this.value.replace(/[^a-zA-Z0-9\s]/g, '')" value="${exp.company || ''}">
            <input type="text" class="cssbar" placeholder="YYYY-YYYY" maxlength="9" oninput="formatYearRange(this)" value="${exp.years || ''}">
            <button type="button" onclick="removeEntry(this)">Remove</button>
          `;
          liste.insertBefore(entry, liste.lastElementChild);
        });
      } 

            if (user.skills && user.skills.length > 0) {
        const list = document.getElementById("skills");
        user.skills.forEach(sk => {
          const entry = document.createElement("div");
          entry.className = "skill-entry";
          entry.innerHTML = `
            <input type="text" class="cssbar" placeholder="EX: Penteration Testing" oninput="this.value = this.value.replace(/[^a-zA-Z\s]/g, '')" value="${sk}">
            <button type="button" onclick="removeEntry(this)">Remove</button>
          `;
          list.insertBefore(entry, list.lastElementChild);
        });
      }



      document.getElementById("editf").addEventListener("submit", async (e) => {
  e.preventDefault();

  const education = [];
  document.querySelectorAll(".education-entry").forEach(entry => {
    const inputs = entry.querySelectorAll("input");
    education.push({ school: inputs[0].value, year: inputs[1].value });
  });

  const experience = [];
  document.querySelectorAll(".exp-entry").forEach(entry => {
    const inputs = entry.querySelectorAll("input");
    experience.push({ company: inputs[0].value, years: inputs[1].value });
  });

  const skills = [];
  document.querySelectorAll(".skill-entry input").forEach(input => {
    skills.push(input.value);
  });

  const body = {
    firstname: document.getElementById("firstname").value,
    lastname: document.getElementById("lastname").value,
    about: document.getElementById("about").value,
    education,
    experience,
    skills
  };

  await fetch("/api/profile/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  window.location.href = "/views/profile.html?id=" + id;
});

}
)





.catch(err=>console.error ("fetch failed",err));
});



   
function addEducation() {
  const list = document.getElementById("educationlist");

  const entry = document.createElement("div");
  entry.className = "education-entry";
  entry.innerHTML = `
    <input type="text" class="cssbar" placeholder="School / University" oninput="this.value = this.value.replace(/[^a-zA-Z\s]/g, '')" >
    <input type="text" class="cssbar" placeholder="YYYY" maxlength="4" oninput="formatYear(this)" >
    <button onclick="removeEntry(this)">Remove</button>
  `;

  list.insertBefore(entry, list.lastElementChild);
}


function addExp()
{
    const liste = document.getElementById("explist");
 const entrye= document.createElement("div");
 entrye.className="exp-entry";
 entrye.innerHTML =`
  <input type="text"   class="cssbar" placeholder="Company"  oninput="this.value = this.value.replace(/[^a-zA-Z0-9\s]/g, '')" >
  <input type="text"  class="cssbar" placeholder="YYYY-YYYY" maxlength="9" oninput="formatYearRange(this)">
  <button type="button" onclick="removeEntry(this)">Remove</button>
 `;
 liste.insertBefore(entrye, liste.lastElementChild);
}



function addCert()
{

 const list = document.getElementById("certlist");

  const entry = document.createElement("div");
  entry.className = "certif-entry";
  entry.innerHTML = `
     <input type="file" class="cssbar" accept=".png,.jpg,.jpeg">
    <button onclick="removeEntry(this)">Remove</button>
  `;

  list.insertBefore(entry, list.lastElementChild);



}

function addSkill()
{

 const list = document.getElementById("skills");

  const entry = document.createElement("div");
  entry.className = "skill-entry";
  entry.innerHTML = `
     <input type="text" class="cssbar" placeholder="EX: Penteration Testing" oninput="this.value = this.value.replace(/[^a-zA-Z\s]/g, '')" >
    <button onclick="removeEntry(this)">Remove</button>
  `;

  list.insertBefore(entry, list.lastElementChild);



}


function removeEntry(btn) {
  btn.parentElement.remove();
}


function formatYearRange(input) {
  let val = input.value.replace(/[^0-9]/g, '');
  

  if (val.length >= 1 && !/^[12]/.test(val)) {
    val = val.substring(1);
  }
  

  if (val.length >= 2 && val[0]==1 && !/^[1][9]/.test(val)) {
    val = val.substring(0, 1);
  }
   if (val.length >= 2 && val[0]==2 && !/^[2][0]/.test(val)) {
    val = val.substring(0, 1);
  }

    if (val.length >= 3 && val[0]==2 && !/^[2][0][0-2]/.test(val)) {
    val = val.substring(0, 2);
  }


  if (val.length > 4) {
    val = val.substring(0, 4) + '-' + val.substring(4);
  }


  if (val.length >= 6 && !/^[12]/.test(val[5])) {
    val = val.substring(0, 5);
  }

    if (val.length >= 7 && val[5]==1 && !/^[9]/.test(val[6])) {
    val = val.substring(0, 6);
  }

      if (val.length >= 7 && val[5]==2 && !/^[0]/.test(val[6])) {
    val = val.substring(0, 6);
  }

    if (val.length >= 8 && val[5]==2 && !/^[0-2]/.test(val[7])) {
    val = val.substring(0, 7);
  }
 

  input.value = val;
}


function formatYear(input) {
  let val = input.value.replace(/[^0-9]/g, '');
  if (val.length >= 1 && !/^[12]/.test(val)) 
  {
  val=val.substring(1);
  }
  if (val.length >= 2 && val[0]==1 && !/^[1][9]/.test(val))
   {
   val =val.substring(0, 1);
   }
    if (val.length >= 2 && val[0]==2 && !/^[2][0]/.test(val))
   {
   val =val.substring(0, 1);
   }
     if (val.length >= 3 && val[0]==2 && !/^[2][0][0-4]/.test(val)) {
    val = val.substring(0, 2);
  }
  input.value = val;
}