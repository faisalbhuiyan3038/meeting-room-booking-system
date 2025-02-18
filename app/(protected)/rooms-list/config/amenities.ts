import {
  Wifi, Tv, Video, Monitor, Pencil, FileText,
  Thermometer, Flame, Blinds, Zap, Phone, Droplets,
  Accessibility, Sun, Armchair, Table2
} from "lucide-react";

export const amenities = [
  "wifi",
  "videoConference",
  "tv",
  "projector",
  "whiteboard",
  "flipChart",
  "airConditioning",
  "heating",
  "windowCoverings",
  "powerOutlets",
  "deskPhoneSystem",
  "waterDispenser",
  "handicapAccessible",
  "naturalLight",
  "chairs",
  "conferenceTable",
] as const;

export type Amenity = (typeof amenities)[number];

export const amenityIcons = {
  wifi: Wifi,
  videoConference: Video,
  tv: Tv,
  projector: Monitor,
  whiteboard: Pencil,
  flipChart: FileText,
  airConditioning: Thermometer,
  heating: Flame,
  windowCoverings: Blinds,
  powerOutlets: Zap,
  deskPhoneSystem: Phone,
  waterDispenser: Droplets,
  handicapAccessible: Accessibility,
  naturalLight: Sun,
  chairs: Armchair,
  conferenceTable: Table2,
};

export const amenityOptions = amenities.map(amenity => ({
  label: amenity
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" "),
  value: amenity
}));
