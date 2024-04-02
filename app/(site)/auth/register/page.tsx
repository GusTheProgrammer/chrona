"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import useUserInfoStore from "@/zustand/userStore";
import useApi from "@/hooks/useApi";
import FormContainer from "@/components/FormContainer";
import Message from "@/components/Message";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormDescription } from "@/components/ui/form";
import CustomFormField, { FormButton } from "@/components/ui/CustomForm";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const FormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  teamId: z.string(),
  isManager: z.boolean().default(false),
});

const Page = () => {
  const router = useRouter();
  const params = useSearchParams().get("next");
  const { updateUserInfo } = useUserInfoStore((state) => state);
  const [teams, setTeams] = useState([]);

  const teamsApi = useApi({
    key: ["teams"],
    method: "GET",
    url: `teams`,
  }).get;

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
      updateUserInfo(postApi.data);
      router.push("/auth/login");
    }

    if (teamsApi?.data) {
      setTeams(teamsApi.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postApi?.isSuccess, teamsApi?.data]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      teamId: "",
      isManager: false,
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    console.log(values);
    postApi?.mutateAsync(values);
  }

  return (
    <FormContainer title="Register">
      {postApi?.isError && <Message value={postApi?.error} />}
      {teamsApi?.isError && <Message value="Failed to load teams" />}

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
          <FormField
            control={form.control}
            name="teamId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="font-bold text-gray-700">Team</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          " justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? teams.find((team) => team.id === field.value)?.name
                          : "Select team"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Search teams..." />
                      <CommandEmpty>No team found.</CommandEmpty>
                      <CommandGroup>
                        {teams.map((team) => (
                          <CommandItem
                            key={team.id}
                            onSelect={() => {
                              form.setValue("teamId", team.id);
                              // Optional: Close the popover here if you have access to the popover close action
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                team.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {team.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isManager"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <div className="flex flex-row items-center space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div>
                    <FormLabel>Are you a manager?</FormLabel>
                    <FormDescription>
                      Managers will have to be approved manually by the admin.
                    </FormDescription>
                  </div>
                </div>
              </FormItem>
            )}
          />

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
