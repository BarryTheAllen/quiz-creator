export interface IAnswer {
  text: string;
  isCorrect: boolean;
}

export interface IQuestion {
  text: string;
  answers: IAnswer[];
}

export interface ITest {
  title: string;
  slug: string;
  questions: IQuestion[];
}
