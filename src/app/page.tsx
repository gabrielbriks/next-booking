import { Calendar } from "@/components/Calendar";
import { prisma } from "@/lib/prisma";
import { Day } from '@prisma/client';
import { formatISO } from "date-fns";

interface HomeProps {
  days: Day[];
  closeDays: string[]; // as ISO string
}

export default async function Home() {

  const days = await prisma.day.findMany();
  const closeDays = (await prisma.closedDay.findMany()).map((d) => formatISO(d.date))
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-lg font-medium">Booking Calendar</h1>

      <div>
        <Calendar days={days} closedDays={closeDays} />
      </div>
    </main>
  )
}


