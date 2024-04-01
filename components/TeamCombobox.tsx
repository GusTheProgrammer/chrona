"use client"

import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const teams = [
  { value: "team1", label: "Team One" },
  { value: "team2", label: "Team Two" },
  { value: "team3", label: "Team Three" },
  { value: "team4", label: "Team Four" },
];

export function TeamCombobox({ onTeamSelect }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? teams.find((team) => team.value === value)?.label : "Select Team..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search team..." />
          <CommandEmpty>No team found.</CommandEmpty>
          <CommandGroup>
            {teams.map((team) => (
              <CommandItem key={team.value} value={team.value} onSelect={() => onTeamSelect(team)}>
                <Check className={`mr-2 h-4 w-4 ${value === team.value ? "opacity-100" : "opacity-0"}`} />
                {team.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
