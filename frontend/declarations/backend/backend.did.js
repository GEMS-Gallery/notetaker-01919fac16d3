export const idlFactory = ({ IDL }) => {
  const Result_2 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Bool, 'err' : IDL.Text });
  const Note = IDL.Record({
    'id' : IDL.Nat,
    'subject' : IDL.Text,
    'bulletPoints' : IDL.Vec(IDL.Text),
  });
  const Result_1 = IDL.Variant({ 'ok' : Note, 'err' : IDL.Text });
  return IDL.Service({
    'createNote' : IDL.Func([IDL.Text, IDL.Vec(IDL.Text)], [Result_2], []),
    'deleteNote' : IDL.Func([IDL.Nat], [Result], []),
    'getNote' : IDL.Func([IDL.Nat], [Result_1], ['query']),
    'getNotes' : IDL.Func([], [IDL.Vec(Note)], ['query']),
    'updateNote' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Vec(IDL.Text)],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
