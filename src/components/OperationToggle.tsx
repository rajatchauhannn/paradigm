import { type ParfileConfig } from '../types';

interface OperationToggleProps {
  operation: ParfileConfig['operation'];
  onOperationChange: (op: ParfileConfig['operation']) => void;
}

export const OperationToggle = ({ operation, onOperationChange }: OperationToggleProps) => {
  return (
    <fieldset>
      <legend>Operation Type</legend>
      <input
        type="radio"
        id="op_export"
        name="operation"
        value="EXPORT"
        checked={operation === 'EXPORT'}
        onChange={() => onOperationChange('EXPORT')}
      />
      <label htmlFor="op_export">Export (expdp)</label>
      <br />
      <input
        type="radio"
        id="op_import"
        name="operation"
        value="IMPORT"
        checked={operation === 'IMPORT'}
        onChange={() => onOperationChange('IMPORT')}
      />
      <label htmlFor="op_import">Import (impdp)</label>
    </fieldset>
  );
};