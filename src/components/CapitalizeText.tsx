interface CapitalizeTextProps {
  text: string;
}

const CapitalizeText: React.FC<CapitalizeTextProps> = ({ text }) => {
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return <>{capitalize(text)}</>;
};

export default CapitalizeText;
