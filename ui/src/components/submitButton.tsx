import { ReactNode, ComponentProps } from "react";
import { Button, CircularProgress } from "@mui/material";

interface Props {
  submitting: boolean;
  children: ReactNode;
}

export default function SubmitButton({
  submitting,
  children,
  ...rest
}: Props & ComponentProps<typeof Button>) {
  return (
    <Button type="submit" variant="contained" disabled={submitting} {...rest}>
      {submitting && <CircularProgress size={18} className="mr-2" />}
      {children}
    </Button>
  );
}
