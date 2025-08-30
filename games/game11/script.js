
    
const questions = {
    space: [
        {
            question: "ما هو أكبر كوكب في النظام الشمسي؟",
            answers: ["الأرض", "المشتري", "زحل"],
            correctAnswer: "المشتري",
            explanation: "المشتري هو أكبر كوكب في النظام الشمسي."
        },
        {
            question: "ما هو الكوكب الذي يشتهر بالحلقات؟",
            answers: ["المريخ", "زحل", "أورانوس"],
            correctAnswer: "زحل",
            explanation: "زحل هو الكوكب المعروف بحلقاته الشهيرة."
        },
        {
            question: "ما هو أقرب كوكب إلى الشمس؟",
            answers: ["عطارد", "الزهرة", "الأرض"],
            correctAnswer: "عطارد",
            explanation: "عطارد هو الكوكب الأقرب إلى الشمس."
        },
        {
            question: "ما هو اسم القمر الذي يدور حول الأرض؟",
            answers: ["تيتان", "القمر", "إيو"],
            correctAnswer: "القمر",
            explanation: "القمر هو التابع الطبيعي الوحيد للأرض."
        },
        {
            question: "ما اسم أول إنسان صعد إلى الفضاء؟",
            answers: ["نيل آرمسترونغ", "يوري غاغارين", "بز ألدرن"],
            correctAnswer: "يوري غاغارين",
            explanation: "يوري غاغارين هو أول إنسان صعد إلى الفضاء عام 1961."
        },
        {
            question: "ما اسم أول مركبة هبطت على سطح القمر؟",
            answers: ["أبولو 11", "فويجر 1", "مارينر 4"],
            correctAnswer: "أبولو 11",
            explanation: "أبولو 11 هي أول مركبة هبطت على سطح القمر عام 1969."
        },
        {
            question: "ما هو الكوكب الأحمر؟",
            answers: ["زحل", "المريخ", "أورانوس"],
            correctAnswer: "المريخ",
            explanation: "المريخ يُعرف بالكوكب الأحمر بسبب لونه الناتج عن أكسيد الحديد."
        },
        {
            question: "كم عدد الكواكب في النظام الشمسي؟",
            answers: ["8", "9", "7"],
            correctAnswer: "8",
            explanation: "يوجد 8 كواكب معترف بها في النظام الشمسي."
        },
        {
            question: "أي كوكب يُعرف بـ 'توأم الأرض'؟",
            answers: ["الزهرة", "عطارد", "نبتون"],
            correctAnswer: "الزهرة",
            explanation: "الزهرة يُعرف بتوأم الأرض بسبب حجمه المشابه."
        },
        {
            question: "ما اسم التلسكوب الشهير الذي يدور حول الأرض؟",
            answers: ["هابل", "جيمس ويب", "كبلر"],
            correctAnswer: "هابل",
            explanation: "تلسكوب هابل الفضائي يدور حول الأرض ويوفر صورًا دقيقة للكون."
        }
    ],
    
    math: [
        {
            question: "ما هو ناتج جمع 23 + 17؟",
            answers: ["40", "41", "42"],
            correctAnswer: "40",
            explanation: "العملية الحسابية 23 + 17 = 40."
        },
        {
            question: "إذا كانت لديك 5 تفاحات وأعطيت 2 منها لصديقك، كم تبقى لديك؟",
            answers: ["2", "3", "4"],
            correctAnswer: "3",
            explanation: "بعد إعطاء 2 تفاحات لصديقك، يبقى لديك 3."
        },
        {
            question: "كم عدد الأضلاع في مثلث؟",
            answers: ["3", "4", "5"],
            correctAnswer: "3",
            explanation: "المثلث يحتوي على 3 أضلاع."
        },
        {
            question: "ما هو ناتج ضرب 6 × 7؟",
            answers: ["42", "36", "48"],
            correctAnswer: "42",
            explanation: "6 × 7 = 42."
        },
        {
            question: "ما هو الرقم الذي إذا قسمته على 2 يعطي 5؟",
            answers: ["10", "12", "8"],
            correctAnswer: "10",
            explanation: "10 ÷ 2 = 5."
        },
        {
            question: "ما هو العدد التالي في التسلسل: 2، 4، 6، ؟",
            answers: ["8", "10", "7"],
            correctAnswer: "8",
            explanation: "التسلسل يزيد بمقدار 2، لذا العدد التالي هو 8."
        },
        {
            question: "إذا كان لديك 3 صناديق، كل صندوق يحتوي على 4 كرات، كم عدد الكرات الإجمالي؟",
            answers: ["12", "9", "15"],
            correctAnswer: "12",
            explanation: "3 × 4 = 12 كرات."
        },
        {
            question: "ما هو نصف العدد 18؟",
            answers: ["9", "8", "10"],
            correctAnswer: "9",
            explanation: "نصف 18 هو 9."
        },
        {
            question: "ما هو ناتج 100 - 45؟",
            answers: ["55", "65", "60"],
            correctAnswer: "55",
            explanation: "100 - 45 = 55."
        },
        {
            question: "إذا كان لديك 10 جنيهات وأنفقت 4 جنيهات، كم يتبقى لديك؟",
            answers: ["6", "5", "7"],
            correctAnswer: "6",
            explanation: "10 - 4 = 6 جنيهات."
        }
    ],
    
    arabic: [
        {
            question: "ما هو الاسم المناسب لهذه الجملة: 'أنا'؟",
            answers: ["اسم", "فعل", "حرف"],
            correctAnswer: "اسم",
            explanation: "'أنا' هي اسم في الجملة."
        },
        {
            question: "ما هو الفعل المضارع في هذه الجملة: 'أدرس اللغة العربية'؟",
            answers: ["أدرس", "اللغة", "العربية"],
            correctAnswer: "أدرس",
            explanation: "الفعل المضارع في الجملة هو 'أدرس'."
        },
        {
            question: "كيف تكتب كلمة 'كتاب' في الجمع؟",
            answers: ["كتب", "كتباء", "كتبات"],
            correctAnswer: "كتب",
            explanation: "جمع كلمة 'كتاب' هو 'كتب'."
        },
        {
            question: "ما نوع الكلمة 'جميل'؟",
            answers: ["اسم", "فعل", "صفة"],
            correctAnswer: "صفة",
            explanation: "'جميل' هي صفة تصف الاسم."
        },
        {
            question: "ما هو جمع كلمة 'قلم'؟",
            answers: ["أقلام", "قلمات", "قلمون"],
            correctAnswer: "أقلام",
            explanation: "جمع 'قلم' هو 'أقلام'."
        },
        {
            question: "ما هو ضد كلمة 'سعيد'؟",
            answers: ["حزين", "فرحان", "مسرور"],
            correctAnswer: "حزين",
            explanation: "ضد 'سعيد' هو 'حزين'."
        },
        {
            question: "ما هو مرادف كلمة 'سريع'؟",
            answers: ["بطيء", "عاجل", "متأني"],
            correctAnswer: "عاجل",
            explanation: "مرادف 'سريع' هو 'عاجل'."
        },
        {
            question: "ما هو الحرف الذي يأتي بعد 'ب'؟",
            answers: ["ت", "ث", "ج"],
            correctAnswer: "ت",
            explanation: "الحرف الذي يلي 'ب' هو 'ت'."
        },
        {
            question: "ما هو نوع الجملة: 'الولد يقرأ الكتاب'؟",
            answers: ["جملة اسمية", "جملة فعلية", "جملة شرطية"],
            correctAnswer: "جملة فعلية",
            explanation: "تبدأ الجملة بالفعل 'يقرأ'، لذا هي جملة فعلية."
        },
        {
            question: "ما هو المفرد من كلمة 'أصدقاء'؟",
            answers: ["صديق", "رفيق", "زميل"],
            correctAnswer: "صديق",
            explanation: "مفرد 'أصدقاء' هو 'صديق'."
        }
    ],
    
    english: [
        {
            question: "How do you say 'apple' in Arabic?",
            answers: ["تفاح", "برتقال", "موز"],
            correctAnswer: "تفاح",
            explanation: "'تفاح' is the Arabic word for 'apple'."
        },
        {
            question: "What is the plural of 'child'?",
            answers: ["children", "childs", "childrens"],
            correctAnswer: "children",
            explanation: "The plural of 'child' is 'children'."
        },
        {
            question: "How do you say 'good morning' in Arabic?",
            answers: ["صباح الخير", "مساء الخير", "وداعًا"],
            correctAnswer: "صباح الخير",
            explanation: "'صباح الخير' means 'good morning' in Arabic."
        },
        {
            question: "What is the opposite of 'hot'?",
            answers: ["Cold", "Big", "Fast"],
            correctAnswer: "Cold",
            explanation: "The opposite of 'hot' is 'cold'."
        },
        {
            question: "Which of these is a fruit?",
            answers: ["Apple", "Car", "Chair"],
            correctAnswer: "Apple",
            explanation: "Apple is a fruit."
        },
        {
            question: "What color is the sky on a clear day?",
            answers: ["Blue", "Red", "Green"],
            correctAnswer: "Blue",
            explanation: "The sky is blue on a clear day."
        },
        {
            question: "How do you say 'قطة' in English?",
            answers: ["Cat", "Dog", "Fish"],
            correctAnswer: "Cat",
            explanation: "'قطة' means 'Cat' in English."
        },
        {
            question: "Which word is a verb?",
            answers: ["Run", "Tree", "Book"],
            correctAnswer: "Run",
            explanation: "'Run' is a verb; it describes an action."
        },
        {
            question: "What is the plural of 'book'?",
            answers: ["Books", "Bookes", "Bookz"],
            correctAnswer: "Books",
            explanation: "The plural of 'book' is 'books'."
        },
        {
            question: "What is the first letter in the word 'Elephant'?",
            answers: ["E", "L", "P"],
            correctAnswer: "E",
            explanation: "The first letter in 'Elephant' is 'E'."
        }
    ],
    history: [
        {
            question: "من هو أول رئيس للولايات المتحدة الأمريكية؟",
            answers: ["أبراهام لينكولن", "جورج واشنطن", "توماس جيفرسون"],
            correctAnswer: "جورج واشنطن",
            explanation: "جورج واشنطن هو أول رئيس للولايات المتحدة الأمريكية."
        },
        {
            question: "أين حدثت معركة حطين؟",
            answers: ["مصر", "فلسطين", "العراق"],
            correctAnswer: "فلسطين",
            explanation: "معركة حطين حدثت في فلسطين."
        },
        {
            question: "في أي سنة اكتشفت أمريكا؟",
            answers: ["1492", "1500", "1600"],
            correctAnswer: "1492",
            explanation: "أمريكا اكتشفت في عام 1492."
        },
        {
            question: "من هو القائد المسلم الذي فتح الأندلس؟",
            answers: ["طارق بن زياد", "صلاح الدين الأيوبي", "خالد بن الوليد"],
            correctAnswer: "طارق بن زياد",
            explanation: "طارق بن زياد هو القائد الذي فتح الأندلس."
        },
        {
            question: "في أي عام قامت ثورة 23 يوليو في مصر؟",
            answers: ["1952", "1948", "1967"],
            correctAnswer: "1952",
            explanation: "ثورة 23 يوليو قامت عام 1952."
        },
        {
            question: "من هو أول خليفة في الإسلام؟",
            answers: ["أبو بكر الصديق", "عمر بن الخطاب", "عثمان بن عفان"],
            correctAnswer: "أبو بكر الصديق",
            explanation: "أبو بكر الصديق هو أول خليفة في الإسلام."
        },
        {
            question: "ما هي الحضارة التي بنت الأهرامات؟",
            answers: ["الحضارة الفرعونية", "الحضارة الرومانية", "الحضارة اليونانية"],
            correctAnswer: "الحضارة الفرعونية",
            explanation: "الأهرامات بُنيت في عهد الحضارة الفرعونية."
        },
        {
            question: "من هو القائد الذي هزم المغول في معركة عين جالوت؟",
            answers: ["سيف الدين قطز", "صلاح الدين الأيوبي", "بيبرس"],
            correctAnswer: "سيف الدين قطز",
            explanation: "سيف الدين قطز هزم المغول في معركة عين جالوت."
        },
        {
            question: "في أي عام سقطت بغداد على يد المغول؟",
            answers: ["1258", "1234", "1300"],
            correctAnswer: "1258",
            explanation: "بغداد سقطت على يد المغول عام 1258."
        },
        {
            question: "من هو أول رئيس لمصر بعد الثورة؟",
            answers: ["محمد نجيب", "جمال عبد الناصر", "أنور السادات"],
            correctAnswer: "محمد نجيب",
            explanation: "محمد نجيب هو أول رئيس لمصر بعد الثورة."
        }
        
    ],
    engineering: [
        {
            question: "ما هو نوع المادة الأكثر استخدامًا في البناء؟",
            answers: ["الخشب", "الأسمنت", "الزجاج"],
            correctAnswer: "الأسمنت",
            explanation: "الأسمنت هو المادة الأكثر استخدامًا في البناء."
        },
        {
            question: "ما هي الأداة المستخدمة لقياس الزوايا؟",
            answers: ["المسطرة", "المنقلة", "الميزان"],
            correctAnswer: "المنقلة",
            explanation: "المنقلة هي الأداة المستخدمة لقياس الزوايا."
        },
        {
            question: "أي من هذه الأنواع من الجسور يُسمى 'جسر معلق'؟",
            answers: ["الجسر الزجاجي", "الجسر المعلق", "جسر القوس"],
            correctAnswer: "الجسر المعلق",
            explanation: "الجسر المعلق هو نوع من الجسور الشهيرة."
        },
        {
            question: "ما هو عدد زوايا المثلث؟",
            answers: ["3", "4", "5"],
            correctAnswer: "3",
            explanation: "المثلث له 3 زوايا."
        },
        {
            question: "ما هو الشكل الهندسي الذي له 6 أضلاع؟",
            answers: ["سداسي", "خماسي", "ثماني"],
            correctAnswer: "سداسي",
            explanation: "الشكل الذي له 6 أضلاع يُسمى سداسي."
        },
        {
            question: "ما هو المحور الأفقي في نظام الإحداثيات؟",
            answers: ["س", "ص", "ن"],
            correctAnswer: "س",
            explanation: "المحور الأفقي هو محور السينات (س)."
        },
        {
            question: "ما هو الشكل الذي له قاعدتان دائريتان وسطح منحني؟",
            answers: ["أسطوانة", "مخروط", "كرة"],
            correctAnswer: "أسطوانة",
            explanation: "الأسطوانة لها قاعدتان دائريتان وسطح منحني."
        },
        {
            question: "في البناء، ما هو العنصر الذي يستخدم لتقوية الأعمدة؟",
            answers: ["الحديد", "الخشب", "الطين"],
            correctAnswer: "الحديد",
            explanation: "الحديد يستخدم لتقوية الأعمدة."
        },
        {
            question: "ما هو اسم الأداة التي تُستخدم لرسم دائرة؟",
            answers: ["الفرجار", "المسطرة", "المنقلة"],
            correctAnswer: "الفرجار",
            explanation: "الفرجار يُستخدم لرسم الدوائر."
        },
        {
            question: "ما هو المكون الأساسي للخرسانة؟",
            answers: ["الأسمنت", "الزجاج", "المعدن"],
            correctAnswer: "الأسمنت",
            explanation: "الأسمنت هو المكون الرئيسي في الخرسانة."
        }  
    ],
    science: [
        {
            question: "ما هو الغاز الذي نتنفسه لنعيش؟",
            answers: ["الأوكسجين", "النيتروجين", "الهيدروجين"],
            correctAnswer: "الأوكسجين",
            explanation: "نحن نتنفس الأوكسجين للبقاء على قيد الحياة."
        },
        {
            question: "ما هي الكائنات الحية التي تحصل على طعامها من الشمس؟",
            answers: ["الحيوانات", "النباتات", "الفطريات"],
            correctAnswer: "النباتات",
            explanation: "النباتات تحصل على طعامها من الشمس عبر عملية التمثيل الضوئي."
        },
        {
            question: "ما هو الجزء الذي يساعد النبات على امتصاص الماء من التربة؟",
            answers: ["الأوراق", "الجذور", "الزهور"],
            correctAnswer: "الجذور",
            explanation: "الجذور هي المسؤولة عن امتصاص الماء من التربة."
        },
        {
            question: "ما هو أكبر عضو في جسم الإنسان؟",
            answers: ["الكبد", "القلب", "الدماغ"],
            correctAnswer: "الكبد",
            explanation: "الكبد هو أكبر عضو في جسم الإنسان."
        },
    
        {
            question: "ما هو الكوكب الذي يُعرف بالكوكب الأحمر؟",
            answers: ["المريخ", "الزهرة", "عطارد"],
            correctAnswer: "المريخ",
            explanation: "المريخ يُعرف بالكوكب الأحمر."
        },
        {
            question: "ما هو العضو المسؤول عن ضخ الدم في الجسم؟",
            answers: ["القلب", "الرئتين", "الكبد"],
            correctAnswer: "القلب",
            explanation: "القلب هو العضو المسؤول عن ضخ الدم."
        },
        {
            question: "ما هي الحالة السائلة للماء؟",
            answers: ["الماء", "البخار", "الثلج"],
            correctAnswer: "الماء",
            explanation: "الحالة السائلة للماء هي الماء."
        },
        {
            question: "ما هو الغاز الذي يستخدمه النبات في عملية التمثيل الضوئي؟",
            answers: ["ثاني أكسيد الكربون", "الأوكسجين", "النيتروجين"],
            correctAnswer: "ثاني أكسيد الكربون",
            explanation: "النبات يستخدم ثاني أكسيد الكربون في التمثيل الضوئي."
        },
        {
            question: "ما هو أكبر كوكب في النظام الشمسي؟",
            answers: ["المشتري", "زحل", "نبتون"],
            correctAnswer: "المشتري",
            explanation: "المشتري هو أكبر كوكب في النظام الشمسي."
        },
        {
            question: "ما هو الجهاز الذي يستخدمه العلماء لمراقبة النجوم؟",
            answers: ["التلسكوب", "الميكروسكوب", "البارومتر"],
            correctAnswer: "التلسكوب",
            explanation: "التلسكوب يُستخدم لمراقبة النجوم."
        },
        {
            question: "ما هو العنصر الذي يُستخدم في صناعة المصابيح الكهربائية؟",
            answers: ["التنجستن", "الحديد", "النحاس"],
            correctAnswer: "التنجستن",
            explanation: "التنجستن يُستخدم في صناعة المصابيح الكهربائية."
        }
    ],
        
     
    
    social: [
        {
            question: "ما هو أطول نهر في العالم؟",
            answers: ["النيل", "الأمازون", "اليانغتسي"],
            correctAnswer: "النيل",
            explanation: "النيل هو أطول نهر في العالم."
        },
        {
            question: "ما هو اسم أكبر قارة في العالم؟",
            answers: ["أفريقيا", "آسيا", "أمريكا الجنوبية"],
            correctAnswer: "آسيا",
            explanation: "آسيا هي أكبر قارة في العالم."
        },
        {
            question: "أي من هذه الدول هي جزء من قارة إفريقيا؟",
            answers: ["مصر", "أستراليا", "اليابان"],
            correctAnswer: "مصر",
            explanation: "مصر هي دولة تقع في قارة إفريقيا."
        },
        {
            question: "ما هي عاصمة المملكة العربية السعودية؟",
            answers: ["الرياض", "جدة", "مكة"],
            correctAnswer: "الرياض",
            explanation: "عاصمة السعودية هي الرياض."
        },
        {
            question: "ما هي قارة مصر؟",
            answers: ["أفريقيا", "آسيا", "أوروبا"],
            correctAnswer: "أفريقيا",
            explanation: "مصر تقع في قارة أفريقيا."
        },
        {
            question: "ما هو البحر الذي يحد مصر من الشمال؟",
            answers: ["البحر المتوسط", "البحر الأحمر", "الخليج العربي"],
            correctAnswer: "البحر المتوسط",
            explanation: "مصر تطل على البحر المتوسط من الشمال."
        },
        {
            question: "في أي اتجاه تشرق الشمس؟",
            answers: ["الشرق", "الغرب", "الشمال"],
            correctAnswer: "الشرق",
            explanation: "الشمس تشرق من جهة الشرق."
        },
        {
            question: "ما هو نهر النيل؟",
            answers: ["نهر", "بحر", "محيط"],
            correctAnswer: "نهر",
            explanation: "نهر النيل هو نهر يجري في مصر."
        },
        {
            question: "كم عدد القارات في العالم؟",
            answers: ["7", "5", "6"],
            correctAnswer: "7",
            explanation: "يوجد 7 قارات في العالم."
        },
        {
            question: "أي من هذه دولة عربية؟",
            answers: ["مصر", "فرنسا", "ألمانيا"],
            correctAnswer: "مصر",
            explanation: "مصر هي دولة عربية."
        }
    ]
};

let currentQuiz = '';
let currentQuestionIndex = 0;
let score = 0;
function startQuiz(world) {
    currentQuiz = world;
    currentQuestionIndex = 0;
    score = 0;
    showQuestion();
}
function showQuestion() {
    const quiz = questions[currentQuiz];
    const questionData = quiz[currentQuestionIndex];
    document.getElementById('question').innerText = questionData.question;
    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';
    questionData.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer;
        button.onclick = () => checkAnswer(answer, questionData);
        answersDiv.appendChild(button);
    });
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('robot-response').innerHTML = '';  
 }

function checkAnswer(answer, questionData) {
    const robotResponse = document.getElementById('robot-response');

    if (answer === questionData.correctAnswer) {
        score++;
        robotResponse.innerHTML = "إجابة صحيحة! رائع جدًا!";
    } else {
        robotResponse.innerHTML = `إجابة خاطئة! الجواب الصحيح هو: ${questionData.correctAnswer}. ${questionData.explanation}`;
    }

    document.getElementById('next-btn').style.display = 'block';
}

function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < questions[currentQuiz].length) {
        showQuestion();
    } else {
        alert(`انتهت اللعبة! حصلت على ${score} من ${questions[currentQuiz].length}`);
        document.getElementById('quiz-container').style.display = 'none';
    }
}



