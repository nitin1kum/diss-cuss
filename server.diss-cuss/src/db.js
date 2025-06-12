import fs from 'fs'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


async function solve() {
  const user_data = JSON.parse(fs.readFileSync("src/public/user.json")).map((t, _id) => ({
    username : t.username,
    email : t.email,
    image : t.image,
    password : t.password,
    emailVerified : true,
    role : "USER"
  }))
  // const user = await prisma.user.findMany();
  // const discussion = await prisma.discussion.findMany();
  // const threads = await prisma.thread.findMany();
  // const reply = JSON.parse(fs.readFileSync("src/public/thread.json")).map((t, _id) => {
  //   const t_id = Math.floor(Math.random() * (threads.length - 1));
  //   const u_id = Math.floor(Math.random() * (user.length - 1));
  //   return {
  //     discussion_id: threads[t_id].discussion_id,
  //     user_id: user[u_id].id,
  //     content: t.content,
  //     html: t.html,
  //     isReply: true,
  //     parent_id : threads[t_id].id
  //   }
  // });
  // console.log(reply)
  await prisma.thread.createMany({
    data: reply
  })
}

solve()