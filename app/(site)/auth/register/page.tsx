"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import useUserInfoStore from "@/zustand/userStore";
import useApi from "@/hooks/useApi";
import FormContainer from "@/components/FormContainer";
import Message from "@/components/Message";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField, { FormButton } from "@/components/ui/CustomForm";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import { CommandItem } from "cmdk";
import { Button } from "@/components/ui/button";

const teams = [
  { label: "Engineering", value: "engineering" },
  { label: "Marketing", value: "marketing" },
  { label: "Sales", value: "sales" },
  { label: "HR", value: "hr" },
] as const;

const FormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  team: z.string({
    required_error: "Please select a team.",
  }),
});

const Page = () => {
  const router = useRouter();
  const params = useSearchParams().get("next");

  const { userInfo, updateUserInfo } = useUserInfoStore((state) => state);

  const postApi = useApi({
    key: ["login"],
    method: "POST",
    url: `auth/register`,
  })?.post;

  useEffect(() => {
    if (postApi?.isSuccess) {
      const { id, email, menu, routes, token, name, mobile, role, image } =
        postApi.data;
      updateUserInfo({
        id,
        email,
        menu,
        routes,
        token,
        name,
        mobile,
        role,
        image,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postApi?.isSuccess]);

  useEffect(() => {
    if (postApi?.isSuccess) {
      // Redirect user to login page after successful registration
      router.push("/auth/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postApi?.isSuccess, router]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    postApi?.mutateAsync(values);
  }

  return (
    <FormContainer title="Register">
      {postApi?.isError && <Message value={postApi?.error} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <CustomFormField
            form={form}
            name="name"
            label="Name"
            placeholder="Enter your name"
          />

          <CustomFormField
            form={form}
            name="email"
            label="Email"
            placeholder="Enter email"
          />
          <CustomFormField
            form={form}
            name="password"
            label="Password"
            placeholder="Enter password"
            type="password"
          />

          <CustomFormField
            form={form}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Enter password again"
            type="password"
          />
          {/* Team selection field */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="mb-4">
                Select Team
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-h-60 overflow-auto">
              {teams.map((team) => (
                <CommandItem
                  key={team.value}
                  onSelect={() => form.setValue("team", team.value)}
                >
                  {team.label}
                </CommandItem>
              ))}
            </PopoverContent>
          </Popover>
          <FormButton
            loading={postApi?.isPending}
            label="Register"
            className="w-full"
          />
        </form>
      </Form>
    </FormContainer>
  );
};

export default Page;
