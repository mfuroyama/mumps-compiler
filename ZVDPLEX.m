ZVDPLEX

; Wrappers for select Lexicon Utility routines

LOOKUP(X,LEN,SRC,SUB,DATE)
 N RES
 S SRC=$G(SRC,""),SUB=$G(SUB,""),RES=""
 D CONFIG^LEXSET(SRC,SUB,DATE)
 D LOOK^LEXA(X,SRC,LEN,SUB,DATE)
 S JSON=$$BUILDLOOKUPJSON
 K LEX
 Q JSON


BUILDLOOKUPJSON()
 S CNT=0
 S ARR="["
 S I=0 F  S I=$O(LEX("LIST",I)) Q:'I  D
 . S ENTRY=LEX("LIST",I)
 . S ARR=ARR_"{""id"":"""_$P(ENTRY,"^")_""",""value"":"""_$P(ENTRY,"^",2)_"""},"
 . S CNT=CNT+1

 ; Trim the trailing comma from the array string
 I CNT>0 S ARR=$E(ARR,0,$L(ARR)-1)
 S ARR=ARR_"]"
 S JSON="{""matches"":"""_LEX_""",""list"":"_ARR_"}"
 Q JSON


LOOKUPALL(X,LEN,SRC,SUB,DATE)
 N RES
 S SRC=$G(SRC,""),SUB=$G(SUB,""),RES=""
 D CONFIG^LEXSET(SRC,SUB,DATE)
 D LOOK^LEXA(X,SRC,LEN,SUB,DATE)
 S JSON=$$BUILDLOOKUPALLJSON
 K ^TMP("LEXFND",$J),LEX
 Q JSON


BUILDLOOKUPALLJSON()
 S CNT=0
 S ARR="["
 W $O(^TMP("LEXFND",$J,""))
 S FREQ="" F  S FREQ=$O(^TMP("LEXFND",$J,FREQ)) Q:'FREQ  D
 . S IEN=0 F  S IEN=$O(^TMP("LEXFND",$J,FREQ,IEN)) Q:'IEN  D
 . . S TEXT=$G(^TMP("LEXFND",$J,FREQ,IEN))
 . . S ARR=ARR_"{""id"":"""_IEN_""",""value"":"""_TEXT_"""},"
 . . S CNT=CNT+1

 ; Trim the trailing comma from the array string
 W "BUILDLOOKUPALLJSON^ZVDPLEX: "_CNT,!
 I CNT>0 S ARR=$E(ARR,0,$L(ARR)-1)
 S ARR=ARR_"]"
 S JSON="{""matches"":"""_LEX_""",""list"":"_ARR_"}"
 Q JSON


GETSYNONYMS(CODE,SRC,DATE,IEN,DESIGNATIONS,DEACTIVATED)
 S DATE=$G(DATE,""),IEN=$G(IEN,0),DESIGNATIONS=$G(DESIGNATIONS,0),DEACTIVATED=$G(DEACTIVATED,0)
 S RES=$$GETSYN^LEXTRAN1(SRC,CODE,DATE,,IEN,DESIGNATIONS,DEACTIVATED)
 S STATUSCODE=$P(RES,"^"),MESSAGE=$P(RES,"^",2)
 S JSON=$$BUILDSYNONYMJSON(STATUSCODE,MESSAGE)
 K LEX
 Q JSON


BUILDSYNONYMJSON(STATUSCODE,MESSAGE)
 S CNT=0
 S JSON=""
 I STATUSCODE="1" S JSON=$$BUILDSYNONYMDATAJSON()
 E  S JSON=$$BUILDERRORJSON(STATUSCODE,MESSAGE)
 Q JSON


BUILDSYNONYMDATAJSON()
 S CNT=0
 S SYNONYMS="["
 S I=0 F  S I=$O(LEX("S",I)) Q:'I  D
 . S SYNONYMS=SYNONYMS_""""_LEX("S",I)_""","
 . S CNT=CNT+1

 ; Trim the trailing comma from the array string
 I CNT>0 S SYNONYMS=$E(SYNONYMS,0,$L(SYNONYMS)-1)
 S SYNONYMS=SYNONYMS_"]"
 S JSON="{""status"":1,""preferred"":"""_LEX("P")_""",""full"":"""_LEX("F")_""",""synonyms"":"_SYNONYMS_"}"
 Q JSON


GETASSOCIATIONS(CODE,MAPPING,DATE)
 S DATE=$G(DATE,"")
 S RES=$$GETASSN^LEXTRAN1(CODE,MAPPING,DATE)
 S STATUSCODE=$P(RES,"^"),MESSAGE=$P(RES,"^",2)
 S JSON=$$BUILDASSOCIATIONJSON(STATUSCODE,MESSAGE)
 K LEX
 Q JSON


BUILDASSOCIATIONJSON(STATUSCODE,MESSAGE)
 S CNT=0
 S JSON=""
 I +STATUSCODE>=0 S JSON=$$BUILDASSOCIATIONDATAJSON()
 E  S JSON=$$BUILDERRORJSON(STATUSCODE,MESSAGE)
 Q JSON


BUILDASSOCIATIONDATAJSON()
 S CNT=0
 S CODES="["
 S I=0 F  S I=$O(LEX(I)) Q:'I  D
 . S CODE=$O(LEX(I,0))
 . S CODES=CODES_""""_CODE_""","
 . S CNT=CNT+1

 ; Trim the trailing comma from the array string
 I CNT>0 S CODES=$E(CODES,0,$L(CODES)-1)
 S CODES=CODES_"]"
 S JSON="{""status"":1,""codes"":"_CODES_"}"
 Q JSON


BUILDERRORJSON(STATUSCODE,MESSAGE)
 S JSON="{""status"":"_STATUSCODE_",""error"":"""_MESSAGE_"""}"
 Q JSON