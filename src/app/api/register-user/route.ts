import bcrypt from "bcryptjs";
import initDB from "@/libs/db";
import UserModel from "@/model/UserModel";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const { name, email, password } = await request.json();
  initDB();

  const hashedPassword = await bcrypt.hash(password, 10);
  let user = await UserModel.findOne({ email });
  if (user) {
    return Response.json({ message: "User already exist" }, { status: 400 });
  }
  const newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword,
  });
  try {
    await newUser.save();
    return Response.json({ message: "User has created" }, { status: 201 });
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 });
  }
};
