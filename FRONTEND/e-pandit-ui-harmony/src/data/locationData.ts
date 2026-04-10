export interface District {
  name: string;
  pinPrefix: string; // first 3 digits of common pin codes in district
}

export interface StateData {
  name: string;
  districts: District[];
}

export const indianStates: StateData[] = [
  {
    name: "Maharashtra",
    districts: [
      { name: "Mumbai", pinPrefix: "400" },
      { name: "Pune", pinPrefix: "411" },
      { name: "Nagpur", pinPrefix: "440" },
      { name: "Thane", pinPrefix: "400" },
      { name: "Nashik", pinPrefix: "422" },
      { name: "Aurangabad", pinPrefix: "431" },
      { name: "Solapur", pinPrefix: "413" },
      { name: "Kolhapur", pinPrefix: "416" },
      { name: "Amravati", pinPrefix: "444" },
      { name: "Sangli", pinPrefix: "416" },
      { name: "Satara", pinPrefix: "415" },
      { name: "Ratnagiri", pinPrefix: "415" },
      { name: "Ahmednagar", pinPrefix: "414" },
      { name: "Jalgaon", pinPrefix: "425" },
      { name: "Latur", pinPrefix: "413" },
      { name: "Nanded", pinPrefix: "431" },
    ],
  },
  {
    name: "Gujarat",
    districts: [
      { name: "Ahmedabad", pinPrefix: "380" },
      { name: "Surat", pinPrefix: "395" },
      { name: "Vadodara", pinPrefix: "390" },
      { name: "Rajkot", pinPrefix: "360" },
      { name: "Gandhinagar", pinPrefix: "382" },
      { name: "Bhavnagar", pinPrefix: "364" },
      { name: "Junagadh", pinPrefix: "362" },
      { name: "Jamnagar", pinPrefix: "361" },
      { name: "Anand", pinPrefix: "388" },
      { name: "Kutch", pinPrefix: "370" },
    ],
  },
  {
    name: "Karnataka",
    districts: [
      { name: "Bengaluru", pinPrefix: "560" },
      { name: "Mysuru", pinPrefix: "570" },
      { name: "Hubli-Dharwad", pinPrefix: "580" },
      { name: "Mangaluru", pinPrefix: "575" },
      { name: "Belagavi", pinPrefix: "590" },
      { name: "Kalaburagi", pinPrefix: "585" },
      { name: "Tumkuru", pinPrefix: "572" },
      { name: "Shimoga", pinPrefix: "577" },
    ],
  },
  {
    name: "Rajasthan",
    districts: [
      { name: "Jaipur", pinPrefix: "302" },
      { name: "Jodhpur", pinPrefix: "342" },
      { name: "Udaipur", pinPrefix: "313" },
      { name: "Kota", pinPrefix: "324" },
      { name: "Ajmer", pinPrefix: "305" },
      { name: "Bikaner", pinPrefix: "334" },
      { name: "Jaisalmer", pinPrefix: "345" },
      { name: "Pushkar", pinPrefix: "305" },
    ],
  },
  {
    name: "Uttar Pradesh",
    districts: [
      { name: "Lucknow", pinPrefix: "226" },
      { name: "Varanasi", pinPrefix: "221" },
      { name: "Agra", pinPrefix: "282" },
      { name: "Prayagraj", pinPrefix: "211" },
      { name: "Kanpur", pinPrefix: "208" },
      { name: "Noida", pinPrefix: "201" },
      { name: "Ghaziabad", pinPrefix: "201" },
      { name: "Mathura", pinPrefix: "281" },
      { name: "Ayodhya", pinPrefix: "224" },
      { name: "Meerut", pinPrefix: "250" },
    ],
  },
  {
    name: "Madhya Pradesh",
    districts: [
      { name: "Bhopal", pinPrefix: "462" },
      { name: "Indore", pinPrefix: "452" },
      { name: "Jabalpur", pinPrefix: "482" },
      { name: "Gwalior", pinPrefix: "474" },
      { name: "Ujjain", pinPrefix: "456" },
      { name: "Rewa", pinPrefix: "486" },
      { name: "Sagar", pinPrefix: "470" },
    ],
  },
  {
    name: "Tamil Nadu",
    districts: [
      { name: "Chennai", pinPrefix: "600" },
      { name: "Coimbatore", pinPrefix: "641" },
      { name: "Madurai", pinPrefix: "625" },
      { name: "Tiruchirappalli", pinPrefix: "620" },
      { name: "Salem", pinPrefix: "636" },
      { name: "Tirunelveli", pinPrefix: "627" },
      { name: "Kanchipuram", pinPrefix: "631" },
      { name: "Thanjavur", pinPrefix: "613" },
    ],
  },
];

export const getDistrictsByState = (stateName: string): District[] => {
  const state = indianStates.find((s) => s.name === stateName);
  return state ? state.districts : [];
};

export const getStateNames = (): string[] => {
  return indianStates.map((s) => s.name);
};
