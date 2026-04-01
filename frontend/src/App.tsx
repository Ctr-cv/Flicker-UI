import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { IntroPage } from "@/pages/IntroPage";
import { MotionPage } from "@/pages/MotionPage";
import { HapticsPage } from "@/pages/HapticsPage";
import { NeuralPage } from "@/pages/NeuralPage";
import { CloudPage } from "@/pages/CloudPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/intro" replace />} />
        <Route path="intro" element={<IntroPage />} />
        <Route path="motion" element={<MotionPage />} />
        <Route path="haptics" element={<HapticsPage />} />
        <Route path="neural" element={<NeuralPage />} />
        <Route path="cloud" element={<CloudPage />} />
      </Route>
    </Routes>
  );
}
