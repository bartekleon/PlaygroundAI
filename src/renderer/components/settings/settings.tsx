import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useLocalStorage } from "../../utils/useLocalStorage";
import { Button } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && 
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      }
    </div>
  );
};

interface CustomTabsProps {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  tabs: string[];
}

const CustomTabs = ({ value, setValue, tabs }: CustomTabsProps) => {
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

export const Settings = () => {
  const [value, setValue] = React.useState(0);
  const [models_path, setModelsPath] = useLocalStorage("AIImage_models_path", "");
  const [vaes_path, setVaesPath] = useLocalStorage("AIImage_vaes_path", "");
  const [loras_path, setLorasPath] = useLocalStorage("AIImage_loras_path", "");

  const handleModelsChange = () => {
    window.api.choosePath().then(setModelsPath);
  };
  const handleVaesChange = () => {
    window.api.choosePath().then(setVaesPath);
  };
  const handleLorasChange = () => {
    window.api.choosePath().then(setLorasPath);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <CustomTabs value={value} setValue={setValue} tabs={["Image generation", "Item Two", "Item Three"]}/>
      </Box>

      <CustomTabPanel value={value} index={0}>
        <Box my={2}>
          <Button onClick={handleModelsChange}>Choose Models Path</Button>
          <Typography variant="body1">Models path: {models_path}</Typography>
        </Box>
        <Box my={2}>
          <Button onClick={handleVaesChange}>Choose Vaes Path</Button>
          <Typography variant="body1">Models path: {vaes_path}</Typography>
        </Box>
        <Box my={2}>
          <Button onClick={handleLorasChange}>Choose Loras Path</Button>
          <Typography variant="body1">Models path: {loras_path}</Typography>
        </Box>
      </CustomTabPanel>

      <CustomTabPanel value={value} index={1}>
        Item Two
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel>
    </Box>
  );
};
