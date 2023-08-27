import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

interface CustomTabsProps {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  tabs: string[];
}

export const CustomTabs = ({ value, setValue, tabs }: CustomTabsProps) => {
  const handleChange = (_event: React.SyntheticEvent, new_value: number) => {
    setValue(new_value);
  };

  const tabs_elements = tabs.map((label, index) => {
    return (
      <Tab label={label} key={index} id={`tab-${index}`} aria-controls={`tabpanel-${index}`}/>
    );
  });

  return (
    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" children={tabs_elements} />
  );
};
