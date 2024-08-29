import Bool "mo:base/Bool";
import Hash "mo:base/Hash";

import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Iter "mo:base/Iter";

actor {
  type Note = {
    id: Nat;
    subject: Text;
    bulletPoints: [Text];
  };

  stable var nextNoteId: Nat = 0;
  let notes = HashMap.HashMap<Nat, Note>(10, Nat.equal, Nat.hash);

  public func createNote(subject: Text, bulletPoints: [Text]) : async Result.Result<Nat, Text> {
    try {
      let id = nextNoteId;
      nextNoteId += 1;
      let note: Note = { id; subject; bulletPoints };
      notes.put(id, note);
      #ok(id)
    } catch (e) {
      Debug.print("Error creating note: " # Error.message(e));
      #err("Failed to create note")
    }
  };

  public func updateNote(id: Nat, subject: Text, bulletPoints: [Text]) : async Result.Result<Bool, Text> {
    switch (notes.get(id)) {
      case (null) { #err("Note not found") };
      case (?existingNote) {
        let updatedNote: Note = {
          id = existingNote.id;
          subject = subject;
          bulletPoints = bulletPoints;
        };
        notes.put(id, updatedNote);
        #ok(true)
      };
    }
  };

  public func deleteNote(id: Nat) : async Result.Result<Bool, Text> {
    switch (notes.remove(id)) {
      case (null) { #err("Note not found") };
      case (?_) { #ok(true) };
    }
  };

  public query func getNotes() : async [Note] {
    Iter.toArray(notes.vals())
  };

  public query func getNote(id: Nat) : async Result.Result<Note, Text> {
    switch (notes.get(id)) {
      case (null) { #err("Note not found") };
      case (?note) { #ok(note) };
    }
  };
}
