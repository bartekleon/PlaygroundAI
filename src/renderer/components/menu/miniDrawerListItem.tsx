import { Link } from "react-router-dom";
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

interface MiniDrawerListItemProps  {
  open: boolean;
  icon: React.ReactNode;
  text: string;
  link: string;
}

export const MiniDrawerListItem = ({ open, icon, text, link }: MiniDrawerListItemProps) => {
  return (
    <Link to={link}>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton sx={{ minHeight: 48, justifyContent: open ? "initial" : "center", px: 2.5 }}>
          <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : "auto", justifyContent: "center" }}>
            {icon}
          </ListItemIcon>
          <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
        </ListItemButton>
      </ListItem>
    </Link>
  );
};
