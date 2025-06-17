import flower2 from "@/assets/flower-2.jpg";
import flower3 from "@/assets/flower-3.jpg";
import flower4 from "@/assets/flower-4.jpg";
import flower5 from "@/assets/flower-5.avif";
import flower6 from "@/assets/flower-6.png";
import flowers from "@/assets/flowers.jpg";

export interface Theme {
  id: string;
  image: string;
}

// Define the themes with their IDs and image paths
export const themes: Theme[] = [
  { id: "flower", image: flowers.src },
  { id: "flower-2", image: flower2.src },
  { id: "flower-3", image: flower3.src },
  { id: "flower-4", image: flower4.src },
  { id: "flower-5", image: flower5.src },
  { id: "flower-6", image: flower6.src },
];

// Set a default theme to fall back on
export const defaultTheme = themes[0];
