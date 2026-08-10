export type Audition = {
  id: number;
  project_title: string;
  role_name: string;
  project_type: string;
  audition_date: string | null;
  status: string;
  notes: string;
  created_at: string;
};

export type ScriptLine = {
  id: number;
  audition_id: number;
  position: number;
  element_type: "scene_heading" | "action" | "dialogue";
  character_name: string | null;
  is_mine: boolean;
  content: string;
};
