import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { updateQuestionnaire } from "@/apis/admin/questionnaires";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { QuestionTable } from "./question-table";
import type { Question, Questionnaire } from "./questionnaires.types";

interface QuestionnaireDetailProps {
  questionnaire: Questionnaire;
  questions: Question[];
}

export function QuestionnaireDetail({
  questionnaire,
  questions,
}: QuestionnaireDetailProps) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateQuestionnaire,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "questionnaires"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "questionnaire", questionnaire.id],
      });
    },
  });

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: questionnaire.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      is_active: formData.get("is_active") === "on",
    });
  };

  return (
    <Main className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/admin/questionnaires">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
          Questionnaire Details
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <form
          onSubmit={handleUpdate}
          className="space-y-4 rounded-lg border p-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={questionnaire.title}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={questionnaire.description || ""}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={questionnaire.is_active}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </form>
      </div>

      <div className="rounded-lg border p-4">
        <QuestionTable data={questions} questionnaireId={questionnaire.id} />
      </div>
    </Main>
  );
}
