export interface IAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface IQuestion {
  id: string;
  text: string;
  answers: IAnswer[];
}

export interface ITest {
  title: string;
  slug: string;
  questions: IQuestion[];
}
