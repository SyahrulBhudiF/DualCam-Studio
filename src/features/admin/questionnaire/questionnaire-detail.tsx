import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { updateQuestionnaire } from "@/apis/admin/questionnaires";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createQuestionnaireSchema } from "@/libs/schemas/questionnaire";
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

      toast.success("Questionnaire updated successfully");
      form.reset();
    },
    onError: () => {
      toast.error("Failed to update questionnaire");
    },
  });

  const form = useForm({
    defaultValues: {
      title: questionnaire.title,
      description: questionnaire.description || "",
      is_active: questionnaire.is_active,
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = createQuestionnaireSchema.safeParse(value);
        if (!result.success) {
          return result.error.issues.reduce(
            (acc, issue) => {
              const path = issue.path[0] as string;
              acc[path] = issue.message;
              return acc;
            },
            {} as Record<string, string>,
          );
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        data: {
          id: questionnaire.id,
          title: value.title,
          description: value.description || null,
          is_active: value.is_active,
        },
      });
    },
  });

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
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 rounded-lg border p-4"
        >
          <form.Field name="title">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field name="is_active">
            {(field) => (
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <Label htmlFor="is_active">Active</Label>
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

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
