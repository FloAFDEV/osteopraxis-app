
import React from "react";
import { FancyLoader } from "@/components/ui/fancy-loader";

interface PatientFancyLoaderProps {
  message?: string;
}

const PatientFancyLoader: React.FC<PatientFancyLoaderProps> = ({ message = "Chargement des données..." }) => {
  return <FancyLoader message={message} />;
};

export default PatientFancyLoader;
