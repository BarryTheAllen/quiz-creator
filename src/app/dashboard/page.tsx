import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth/nextAuth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db/mongoose';
import Test from '@/lib/models/testSchema';

type DashboardTest = {
  _id: { toString: () => string };
  title: string;
  slug: string;
};

export default async function DashBoard() {

  const session = await getServerSession(authOptions)

  if(!session) redirect("/Login")

  await dbConnect()
  const tests = await Test.find({creator: session.user?.id})
    .sort({ createdAt: -1 })
    .select("title slug")
    .lean() as DashboardTest[]

  const createTest = async () => {
    "use server"

    const session = await getServerSession(authOptions)
    if(!session?.user?.id) {
      redirect("/Login")
    }

    await dbConnect()

    await Test.create({
      title: "Новый тест",
      slug: `${session.user.id}-${Date.now()}`,
      questions: [],
      creator: session.user.id,
    });

    revalidatePath("/dashboard")
  }

  return (
    <div>
      <form action={createTest}>
        <button>Отправить тест</button>
      </form>

      {tests.length > 0 ? (tests.map((test) => (
      <Link key={test._id.toString()} href={`/test/${test.slug}/edit`}>
        <h3>{test.title}</h3>
      </Link>
      ))) :
        (<div>
        <span>У вас пока еще нет тестов</span>
        </div>)
        }
      
    </div>
  )
}
