export interface TimeBlockConfig{
  start: string;  // "08:00"
  end: string;    // "12:00"
  type: "morning" | "afternoon";
}


export interface TimeBlock {
  start: string;  // "08:00"
  end: string;    // "12:00"
  type: "morning" | "afternoon";
  startMin: number;
  endMin: number;
  duration: number;
  heightPercent: number;
}