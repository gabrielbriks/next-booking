
import { Calendar } from "@/app/components/Calendar";
import { prisma } from "@/lib/prisma";
import { formatISO } from "date-fns";

interface HomeProps {
  days: Day[];
  closeDays: string[]; // as ISO string
}

export default function Home({days, closeDays}: HomeProps) {


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-lg font-medium">Booking Calendar</h1>

      <div>
        <Calendar days={days} closedDays={closeDays} />
      </div>
    </main>
  )
}

export async function getServeSideProps() {
  const days = await prisma.day.findMany();
  const closeDays = await (await prisma.closedDay.findMany()).map((d) => formatISO(d.date))
  
  return { props: {days, closeDays} }
}
