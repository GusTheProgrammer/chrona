"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Head from "next/head";
import useUserInfoStore from "@/zustand/userStore";
import useApi from "@/hooks/useApi";
import FormContainer from "@/components/FormContainer";
import Message from "@/components/Message";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import CustomFormField, { FormButton } from "@/components/ui/CustomForm";
import Link from "next/link";

const Page = () => {
  const router = useRouter();
  const { userInfo } = useUserInfoStore((state) => state);

  const FormSchema = z.object({
    email: z.string().email(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    postApi?.mutateAsync(values);
  }
  const postApi = useApi({
    key: ["forgot-password"],
    method: "POST",
    url: `auth/forgot-password`,
  })?.POST;

  useEffect(() => {
    postApi?.isSuccess && form.reset();
    // eslint-disable-next-line
  }, [postApi?.isSuccess, form.reset]);

  useEffect(() => {
    userInfo.id && router.push("/");
  }, [router, userInfo.id]);

  return (
    <FormContainer title="Forgot Password">
      <Head>
        <title>Forgot</title>
        <meta property="og:title" content="Forgot" key="title" />
      </Head>
      {postApi?.isSuccess && <Message value={postApi?.data?.message} />}
      {postApi?.isError && <Message value={postApi?.error} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <CustomFormField
            form={form}
            name="email"
            label="Email"
            placeholder="Enter email"
          />

          <FormButton
            loading={postApi?.isPending}
            label="Send"
            className="w-full"
          />
        </form>
      </Form>
      <hr className="my-4" />
      <div className="flex justify-between">
        <Link
          href="/auth/login"
          className="text-yellow-500 hover:text-yellow-600"
        >
          Login
        </Link>

        <p>
          Don&apos;t have an account? {""}
          <Link
            href="/auth/register"
            className="text-yellow-500 hover:text-yellow-600"
          >
            Register
          </Link>
        </p>
      </div>
    </FormContainer>
  );
};

export default Page;
