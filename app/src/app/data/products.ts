import { Wind, BedDouble, Refrigerator, Flame, WashingMachine, Fan } from "lucide-react";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  store: string;
  category: string;
  purchaseDate: string;
  price: string;
  serialNumber: string;
  hasWarranty: boolean;
  warrantyUntil: string;
  maintenanceDue: string;
  icon: any;
  specs: ProductSpec[];
  serviceTypes: ('instalacion' | 'mantenimiento' | 'reparacion')[];
  serviceHistory: { id: number; date: string; type: string; provider: string }[];
}

export interface WarrantyClaim {
  id: string;
  claimNumber: string;
  date: string;
  productName: string;
  status: string;
}

export const CLAIMS_DB: Record<string, WarrantyClaim> = {
  '1': {
    id: '1',
    claimNumber: 'REC-2024-0892',
    date: '10 may 2024',
    productName: 'Aire acondicionado de la sala',
    status: 'En proceso',
  },
};

export const PRODUCTS_DB: Record<string, Product> = {
  '1': {
    id: 1,
    name: "Aire acondicionado de la sala",
    brand: "Panasonic",
    store: "Novey",
    category: "Aires acondicionados",
    purchaseDate: "15 oct 2023",
    price: "$450.00",
    serialNumber: "PN-98234-A",
    hasWarranty: true,
    warrantyUntil: "15 oct 2025",
    maintenanceDue: "15 may 2024",
    icon: Wind,
    specs: [
      { label: "Capacidad", value: "12,000 BTU" },
      { label: "Tipo", value: "Inverter Split" },
      { label: "Refrigerante", value: "R-410A" },
      { label: "Área recomendada", value: "15-20 m²" },
      { label: "Voltaje", value: "220V" },
      { label: "SEER", value: "19.5" },
    ],
    serviceTypes: ['instalacion', 'mantenimiento', 'reparacion'],
    serviceHistory: [
      { id: 101, date: "10 Ene 2024", type: "Mantenimiento Preventivo", provider: "Servicio Autorizado" },
    ]
  }
};
