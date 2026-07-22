import WikiNav from "@/components/WikiNav";

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WikiNav />
      {children}
    </>
  );
}
