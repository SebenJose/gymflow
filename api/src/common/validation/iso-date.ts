/** Data no formato `YYYY-MM-DD`, usado nas colunas `date` e nos filtros de período. */
export const ISO_DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/** Data e hora com fuso explícito (`Z` ou `±hh:mm`), para o horário não depender do servidor. */
export const ISO_DATE_TIME_WITH_OFFSET_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;
