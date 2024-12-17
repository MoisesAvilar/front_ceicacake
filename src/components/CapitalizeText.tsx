interface CapitalizeTextProps {
  text: string;
}

const CapitalizeText: React.FC<CapitalizeTextProps> = ({ text }) => {
  const capitalize = (str: string) => {
    return str
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return <>{capitalize(text)}</>;
};

export default CapitalizeText;
