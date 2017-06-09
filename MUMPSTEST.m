MUMPSTEST

; Wrappers for select Lexicon Utility routines

LOOKUP(X,LEN,SRC,SUB,DATE)
 S VAR=100 ; This is a variable
 S X="TEST",Y=SRC
 S (NICE,JUNK)=0
 I X="TEST" D
 . W "IS TEST",!
 . S Y=100
 Q