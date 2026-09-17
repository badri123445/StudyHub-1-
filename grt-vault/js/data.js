const PROFESSOR_CODE = "GRT-FACULTY-2026";
const ADMIN_CODE      = "GRT-ADMIN-2026";


const DEFAULT_DEPARTMENTS = [
  { slug: "cse",  short: "CSE",  name: "Computer Science and Engineering" },
  { slug: "ece",  short: "ECE",  name: "Electronics and Communication Engineering" },
  { slug: "eee",  short: "EEE",  name: "Electrical and Electronics Engineering" },
  { slug: "mech", short: "MECH", name: "Mechanical Engineering" },
  { slug: "it",   short: "IT",   name: "Information Technology" },
  { slug: "aids", short: "AIDS", name: "Artificial Intelligence and Data Science" },
  { slug: "bme",  short: "BME",  name: "Biomedical Engineering" },
];

const CUSTOM_DEPT_KEY = "grtvault_custom_departments";

function getDepartments(){
  let custom = [];
  try{ custom = JSON.parse(localStorage.getItem(CUSTOM_DEPT_KEY)) || []; }catch(e){ custom = []; }
  return [...DEFAULT_DEPARTMENTS, ...custom];
}

function getDeptBySlug(slug){
  return getDepartments().find(d => d.slug === slug) || null;
}

function slugify(str){
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "");
}


function addDepartment(short, name){
  short = (short || "").trim();
  name  = (name || "").trim();
  if(!short || !name) return { ok:false, error: "Please fill in both fields." };

  const slug = slugify(short);
  if(!slug) return { ok:false, error: "That short name isn't valid." };
  if(getDeptBySlug(slug)) return { ok:false, error: "A department with that short name already exists." };

  let custom = [];
  try{ custom = JSON.parse(localStorage.getItem(CUSTOM_DEPT_KEY)) || []; }catch(e){ custom = []; }
  custom.push({ slug, short, name });
  localStorage.setItem(CUSTOM_DEPT_KEY, JSON.stringify(custom));
  return { ok:true, slug };
}

function removeDepartment(slug){
  let custom = [];
  try{ custom = JSON.parse(localStorage.getItem(CUSTOM_DEPT_KEY)) || []; }catch(e){ custom = []; }
  custom = custom.filter(d => d.slug !== slug);
  localStorage.setItem(CUSTOM_DEPT_KEY, JSON.stringify(custom));
  localStorage.removeItem(resourceKey(slug));
}

function isCustomDepartment(slug){
  let custom = [];
  try{ custom = JSON.parse(localStorage.getItem(CUSTOM_DEPT_KEY)) || []; }catch(e){ custom = []; }
  return custom.some(d => d.slug === slug);
}


const CATEGORIES = [
  { value: "paper", label: "Question Papers", accept: "application/pdf",              acceptLabel: "PDF only" },
  { value: "note",  label: "Notes",            accept: "application/pdf",              acceptLabel: "PDF only" },
  { value: "ppt",   label: "PPTs",             accept: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf", acceptLabel: "PPT or PDF" },
];

const SEMESTERS = [
  { value: "2", label: "2nd Semester" },
  { value: "3", label: "3rd Semester" },
  { value: "4", label: "4th Semester" },
  { value: "5", label: "5th Semester" },
  { value: "6", label: "6th Semester" },
  { value: "7", label: "7th Semester" },
  { value: "8", label: "8th Semester" },
];

const EXAM_TYPES = [
  { value: "assessment1", label: "Assessment 1" },
  { value: "assessment2", label: "Assessment 2" },
  { value: "model",       label: "Model Exam" },
  { value: "university",  label: "University Exam" },
  { value: "arrear",      label: "Arrear Paper" },
];

function getCategory(value){ return CATEGORIES.find(c => c.value === value) || CATEGORIES[0]; }
function getExamType(value){ return EXAM_TYPES.find(e => e.value === value) || null; }


function resourceKey(slug){ return `grtvault_resources_${slug}`; }

function getResources(slug, category){
  let all = [];
  try{ all = JSON.parse(localStorage.getItem(resourceKey(slug))) || []; }catch(e){ all = []; }
  return category ? all.filter(r => r.category === category) : all;
}

function saveResources(slug, list){
  localStorage.setItem(resourceKey(slug), JSON.stringify(list));
}

function addResource(slug, resource){
  const list = getResources(slug);
  list.unshift(resource);
  saveResources(slug, list);
}

function deleteResource(slug, id){
  const list = getResources(slug).filter(r => r.id !== id);
  saveResources(slug, list);
}


const ROLE_KEY = "grtvault_role";
const PROF_EMAIL_KEY = "grtvault_professor_email";
const STUDENT_ROLL_KEY = "grtvault_student_roll";
const STUDENT_NAME_KEY = "grtvault_student_name";


const STUDENT_ROLL_PREFIX = "1103";

function getRole(){ return sessionStorage.getItem(ROLE_KEY); }

function setProfessorLoggedIn(email){
  sessionStorage.setItem(ROLE_KEY, "professor");
  sessionStorage.setItem(PROF_EMAIL_KEY, email);
}
function setAdminLoggedIn(){
  sessionStorage.setItem(ROLE_KEY, "admin");
}
function setStudentLoggedIn(roll, name){
  sessionStorage.setItem(ROLE_KEY, "student");
  sessionStorage.setItem(STUDENT_ROLL_KEY, roll);
  sessionStorage.setItem(STUDENT_NAME_KEY, name);
}
function getProfessorEmail(){
  return sessionStorage.getItem(PROF_EMAIL_KEY) || "faculty";
}
function getStudentRoll(){
  return sessionStorage.getItem(STUDENT_ROLL_KEY) || "";
}
function getStudentName(){
  return sessionStorage.getItem(STUDENT_NAME_KEY) || "Student";
}
function logoutAll(){
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(PROF_EMAIL_KEY);
  sessionStorage.removeItem(STUDENT_ROLL_KEY);
  sessionStorage.removeItem(STUDENT_NAME_KEY);
}
