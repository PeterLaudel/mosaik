import { ReactNode } from "react";

export default function Section({ children }: { children: ReactNode }) {
  return <div className="shadow-xl bg-white p-4">{children}</div>;
}
