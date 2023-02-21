import Topnav from "./nav.js";
import Axios from "axios";
import { useState, useEffect } from "react";
import React, { Link, useNavigate } from "react-router-dom";
import Cum_date_load from "../model/Cum_date_load.js";
import { useRecoilState } from "recoil";
import {
  cumDateState,
  questionsSelector,
  questionsState,
  returneeState,
} from "../model/states.js";

export default function Log(props) {
  const [returnee, setReturnee] = useRecoilState(returneeState);
  const [questions, setQuestions] = useRecoilState(questionsSelector);

  const [cumDate, setCumDate] = useRecoilState(cumDateState);
  const navigate = useNavigate();
  const [effectCount, setEffectCount] = useState(0);
  const [effectCount2, setEffectCount2] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // let endpoint1 = 0;
  // let endpoint2 = 0;

  //var endPoint = 0
  function append(questions, question) {
    setQuestions((questions) => [...questions, question]);
  }
  //return multiple boolean of specific date
  function returnMultiple(x, y, z) {
    if (z === undefined) {
      z = cumDate;
    }
    for (var i = 0; i < x.question_answers.length; i++) {
      // console.log("x.question_answers[i].date", x.question_answers[i].date);
      // console.log("" + z.cum_year + "-" + z.cum_month + "-" + z.cum_day);
      // console.log("x.question_answers[i].answer", x.question_answers[i].answer);
      // console.log(x.question_selection[y][0]);

      if (
        x.question_answers[i].date ==
        "" + z.cum_year + "-" + z.cum_month + "-" + z.cum_day
      ) {
        if (x.question_answers[i].answer === x.question_selection[y][0]) {
          return true;
        }
      }
    }
    return false;
  }

  //return boolean of specific date
  function returnBoolean(x, y, z) {
    if (z === undefined) {
      z = cumDate;
    }
    for (var i = 0; i < x.question_answers.length; i++) {
      if (
        x.question_answers[i].date ===
        "" + z.cum_year + "-" + z.cum_month + "-" + z.cum_day
      ) {
        if (x.question_answers[i].answer === true && y == 0) {
          return true;
        } else if (x.question_answers[i].answer === false && y == 1) {
          return true;
        }
      }
    }
    return false;
  }

  //return text of specific date
  function returnText(x, z) {
    if (z === undefined) {
      z = cumDate;
    }
    for (var i = 0; i < x.question_answers.length; i++) {
      if (
        x.question_answers[i].date ==
        "" + z.cum_year + "-" + z.cum_month + "-" + z.cum_day
      ) {
        return x.question_answers[i].answer;
      }
    }
  }

  //change question data into visual form
  function returnInput(x) {
    if (x.question_type === "multiple choice") {
      return (
        <>
          <input
            type="radio"
            name={x.question}
            value={x.question_selection[0]}
            defaultChecked={returnMultiple(x, 0)}
          ></input>
          <label>{x.question_selection[0]}</label>
          <input
            type="radio"
            name={x.question}
            value={x.question_selection[1]}
            defaultChecked={returnMultiple(x, 1)}
          ></input>
          <label>{x.question_selection[1]}</label>
          <input
            type="radio"
            name={x.question}
            value={x.question_selection[2]}
            defaultChecked={returnMultiple(x, 2)}
          ></input>
          <label>{x.question_selection[2]}</label>
        </>
      );
    } else if (x.question_type === "boolean") {
      return (
        <>
          <input
            type="radio"
            name={x.question}
            value={true}
            defaultChecked={returnBoolean(x, 0)}
          ></input>
          <label>True</label>
          <input
            type="radio"
            name={x.question}
            value={false}
            defaultChecked={returnBoolean(x, 1)}
          ></input>
          <label>False</label>
        </>
      );
    } else if (x.question_type === "number") {
      return <input type="number" defaultValue={returnText(x)} />;
    } else {
      return (
        <>
          <input type="text" defaultValue={returnText(x)}></input>
        </>
      );
    }
  }

  //bring data of all questions using loop
  function getData(x) {
    if (x < questions.length) {
      return (
        <>
          <div>
            <p>{questions[x].question}</p>
            {returnInput(questions[x])}
          </div>
          {getData(x + 1)}
        </>
      );
    }
    // else {
    //     endPoint = 1
    // }
    return <></>;
  }
  //test for edit using .map
  // useEffect(() => {
  //   Axios.get("https://diary30wooserver.web.app/api/questions/" + props.profile.user_id).then((res) => {
  //     setQuestions(res.data);
  //     console.log("testQuestions", questions);
  //     //put optional chaning
  //     // questions.map((question, i) => {
  //     //   returnInput(question[i]);
  //     // });
  //   });
  // }, []);

  //useEffect0 - check authentication before rendering
  useEffect(() => {
    if (props.profile.user_id == "") {
      alert(
        "not a valid path - please log in first. \n(note: redirection(F5) is not allowed) "
      );
      navigate("/");
    }
  }, []);

  //useEffect1
  useEffect(() => {
    setQuestions((a) => []);
    console.log("useEffect1 reset questions", questions);
    setEffectCount((prevCount) => prevCount + 1);
    console.log("useEffect1 effectCount", effectCount);
  }, [effectCount2]);

  //useEffect 2
  //bring question set from mysql db and put into returnee
  useEffect(() => {
    if (effectCount == 1) {
      Axios.get(
        "https://diary30wooserver.web.app/api/questions/" +
          props.profile.user_ref
      ).then((response) => {
        var z = 0;
        //first sort questions in their queestion_order
        const sortedData = response.data.sort(
          (a, b) => a.question_order - b.question_order
        );
        console.log("sortedData", sortedData);

        for (var i in sortedData) {
          var temp = sortedData[i].question_selection;

          append(questions, {
            //id: response.data[i].id,
            user_id: sortedData[i].user_id,
            question: sortedData[i].question,
            question_type: sortedData[i].question_type,
            question_selection: temp,
            question_order: sortedData[i].question_order,
            question_answers: sortedData[i].question_answers,
            //tag: "oldQ"
          });
          z++;
        }

        console.log("useEffect2 questions get", questions);
        setEffectCount((prevCount) => prevCount + 1);
      });
    }
  }, [effectCount]);

  //useEffect 3
  useEffect(() => {
    if (effectCount == 2) {
      console.log("sortedData in questions", questions);
      console.log("useEffect3 run");
      setReturnee(getData(0));
      console.log("useEffect3 done", questions);
    }
  }, [effectCount]);

  function changeQuestions(a) {
    setQuestions(a);
  }
  function ChangeReturnee(a) {
    setReturnee(a);
  }

  async function submitAns() {
    try {
      setIsLoading(true);
      await submit();
    } finally {
      setIsLoading(false);
    }
  }
  //put answers in temp and send to db
  async function submit() {
    //shallow copied
    var temp = questions;

    var list = document.getElementById("list");
    for (var i = 0; i < list.childNodes.length; i++) {
      var temp1 = {
        date:
          "" +
          cumDate.cum_year +
          "-" +
          cumDate.cum_month +
          "-" +
          cumDate.cum_day,
        answer: "",
      };

      //multiple
      if (list.childNodes[i].childNodes.length === 7) {
        if (list.childNodes[i].childNodes[1].checked) {
          temp1.answer = list.childNodes[i].childNodes[1].value;
        } else if (list.childNodes[i].childNodes[3].checked) {
          temp1.answer = list.childNodes[i].childNodes[3].value;
        } else if (list.childNodes[i].childNodes[5].checked) {
          temp1.answer = list.childNodes[i].childNodes[5].value;
        }
        //boolean
      } else if (list.childNodes[i].childNodes.length === 5) {
        if (list.childNodes[i].childNodes[1].checked) {
          temp1.answer = true;
        } else if (list.childNodes[i].childNodes[3].checked) {
          temp1.answer = false;
        }
        //text
      } else if (list.childNodes[i].childNodes.length === 2) {
        temp1.answer = list.childNodes[i].childNodes[1].value;
      }

      console.log("temp1", temp1);
      console.log("temp", temp);
      // edit when user's question_answers submit
      for (var j = 0; j < temp[i].question_answers.length; j++) {
        //if question_answer already exist
        if (
          temp[i].question_answers[j].date ===
          "" +
            cumDate.cum_year +
            "-" +
            cumDate.cum_month +
            "-" +
            cumDate.cum_day
        ) {
          var newArray = [...temp];
          var date = newArray[i].question_answers[j].date;
          var answer = temp1.answer;
          var newAns = [...temp[i].question_answers];
          newAns.splice(j, 1, { date, answer });
          newArray[i] = { ...temp[i], question_answers: newAns };
          temp = newArray;
        }
        //if questions exist but question_answer not exist
        else if (j === temp[i].question_answers.length - 1) {
          var newArray = [...temp];
          var newAns = [...temp[i].question_answers];
          newAns.push(temp1);
          newArray[i] = { ...temp[i], question_answers: newAns };
          temp = newArray;
        }
      }
      //if user made questions for the first time and qeustion_answer not exist
      if (temp[i].question_answers.length == 0) {
        var newArray = [...temp];
        newArray[i] = { ...temp[i], question_answers: temp1 };
        temp = newArray;
      }
    }

    for (var i = 0; i < temp.length; i++) {
      await Axios.put("https://diary30wooserver.web.app/api/questions", {
        user_id: props.profile.user_ref,
        question: temp[i].question,
        //question_answers: JSON.stringify(temp[i].question_answers)
        question_answers: temp[i].question_answers,
      });
    }
    //rerender right after submit question_answer
    setEffectCount2((prevCount) => prevCount + 1);
    setEffectCount(0);
    alert("Your submission is correctly submitted on the db");
  }

  return (
    <div id="pageWrapper">
      <Topnav selected="log" />
      <Cum_date_load />
      <div id="list">{returnee}</div>
      <button onClick={submitAns} id="submit" disabled={isLoading}>
        Submit
      </button>
    </div>
  );
}
