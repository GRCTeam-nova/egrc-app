import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { useGetTestesByControle } from "../../../api/controleTestes";
import ResumoUltimoTesteControle from "./ResumoUltimoTesteControle";
import { buildLatestCompletedTestSummary } from "./testeResumoUtils";

const ResumoUltimoTesteControleContainer = ({ controlId }) => {
  const [formData] = useState({ refreshCount: 0 });
  const { acoesJudiciais: tests = [] } = useGetTestesByControle(
    formData,
    controlId,
  );

  const summary = useMemo(
    () => buildLatestCompletedTestSummary(tests),
    [tests],
  );

  if (!summary) return null;

  return <ResumoUltimoTesteControle summary={summary} />;
};

ResumoUltimoTesteControleContainer.propTypes = {
  controlId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ResumoUltimoTesteControleContainer;
