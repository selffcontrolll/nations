
export const US_STATES = [
  { name: "Alabama", code: "AL", neighbors: ["MS", "TN", "GA", "FL"] },
  { name: "Alaska", code: "AK", neighbors: [] }, // Alaska is tricky, maybe neighbor to WA or none? Let's say none for now or maybe neighbor Canada? Actually let's ignore AK/HI or make them neighbor WA/CA for gameplay. Let's neighbor WA for AK.
  { name: "Arizona", code: "AZ", neighbors: ["CA", "NV", "UT", "NM"] },
  { name: "Arkansas", code: "AR", neighbors: ["TX", "OK", "MO", "TN", "MS", "LA"] },
  { name: "California", code: "CA", neighbors: ["OR", "NV", "AZ"] },
  { name: "Colorado", code: "CO", neighbors: ["WY", "NE", "KS", "OK", "NM", "AZ", "UT"] },
  { name: "Connecticut", code: "CT", neighbors: ["NY", "MA", "RI"] },
  { name: "Delaware", code: "DE", neighbors: ["MD", "PA", "NJ"] },
  { name: "Florida", code: "FL", neighbors: ["AL", "GA"] },
  { name: "Georgia", code: "GA", neighbors: ["FL", "AL", "TN", "NC", "SC"] },
  { name: "Hawaii", code: "HI", neighbors: [] }, // Neighbor to CA?
  { name: "Idaho", code: "ID", neighbors: ["WA", "OR", "NV", "UT", "WY", "MT"] },
  { name: "Illinois", code: "IL", neighbors: ["WI", "IA", "MO", "KY", "IN"] },
  { name: "Indiana", code: "IN", neighbors: ["IL", "KY", "OH", "MI"] },
  { name: "Iowa", code: "IA", neighbors: ["MN", "SD", "NE", "MO", "IL", "WI"] },
  { name: "Kansas", code: "KS", neighbors: ["CO", "NE", "MO", "OK"] },
  { name: "Kentucky", code: "KY", neighbors: ["MO", "IL", "IN", "OH", "WV", "VA", "TN"] },
  { name: "Louisiana", code: "LA", neighbors: ["TX", "AR", "MS"] },
  { name: "Maine", code: "ME", neighbors: ["NH"] },
  { name: "Maryland", code: "MD", neighbors: ["VA", "WV", "PA", "DE"] },
  { name: "Massachusetts", code: "MA", neighbors: ["NY", "VT", "NH", "RI", "CT"] },
  { name: "Michigan", code: "MI", neighbors: ["WI", "IN", "OH"] },
  { name: "Minnesota", code: "MN", neighbors: ["ND", "SD", "IA", "WI"] },
  { name: "Mississippi", code: "MS", neighbors: ["LA", "AR", "TN", "AL"] },
  { name: "Missouri", code: "MO", neighbors: ["KS", "NE", "IA", "IL", "KY", "TN", "AR", "OK"] },
  { name: "Montana", code: "MT", neighbors: ["ID", "WY", "SD", "ND"] },
  { name: "Nebraska", code: "NE", neighbors: ["WY", "SD", "IA", "MO", "KS", "CO"] },
  { name: "Nevada", code: "NV", neighbors: ["CA", "OR", "ID", "UT", "AZ"] },
  { name: "New Hampshire", code: "NH", neighbors: ["VT", "ME", "MA"] },
  { name: "New Jersey", code: "NJ", neighbors: ["PA", "NY", "DE"] },
  { name: "New Mexico", code: "NM", neighbors: ["AZ", "CO", "OK", "TX"] },
  { name: "New York", code: "NY", neighbors: ["PA", "NJ", "CT", "MA", "VT"] },
  { name: "North Carolina", code: "NC", neighbors: ["SC", "GA", "TN", "VA"] },
  { name: "North Dakota", code: "ND", neighbors: ["MT", "SD", "MN"] },
  { name: "Ohio", code: "OH", neighbors: ["MI", "IN", "KY", "WV", "PA"] },
  { name: "Oklahoma", code: "OK", neighbors: ["TX", "NM", "CO", "KS", "MO", "AR"] },
  { name: "Oregon", code: "OR", neighbors: ["WA", "ID", "NV", "CA"] },
  { name: "Pennsylvania", code: "PA", neighbors: ["OH", "WV", "MD", "DE", "NJ", "NY"] },
  { name: "Rhode Island", code: "RI", neighbors: ["CT", "MA"] },
  { name: "South Carolina", code: "SC", neighbors: ["GA", "NC"] },
  { name: "South Dakota", code: "SD", neighbors: ["WY", "MT", "ND", "MN", "IA", "NE"] },
  { name: "Tennessee", code: "TN", neighbors: ["AR", "MO", "KY", "VA", "NC", "GA", "AL", "MS"] },
  { name: "Texas", code: "TX", neighbors: ["NM", "OK", "AR", "LA"] },
  { name: "Utah", code: "UT", neighbors: ["NV", "ID", "WY", "CO", "AZ"] },
  { name: "Vermont", code: "VT", neighbors: ["NY", "NH", "MA"] },
  { name: "Virginia", code: "VA", neighbors: ["KY", "WV", "MD", "NC", "TN"] },
  { name: "Washington", code: "WA", neighbors: ["OR", "ID"] },
  { name: "West Virginia", code: "WV", neighbors: ["KY", "OH", "PA", "MD", "VA"] },
  { name: "Wisconsin", code: "WI", neighbors: ["MN", "IA", "IL", "MI"] },
  { name: "Wyoming", code: "WY", neighbors: ["ID", "MT", "SD", "NE", "CO", "UT"] }
];

// Helper to get neighbors by code
export const getNeighbors = (code: string) => {
  const state = US_STATES.find(s => s.code === code);
  return state ? state.neighbors : [];
};
