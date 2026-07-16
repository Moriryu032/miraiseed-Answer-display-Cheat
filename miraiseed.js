(function() {
    console.log('========================================');
    console.log('✨ 答え表示＋選択肢光らせ 完全版');
    console.log('========================================');
    
    // ============================================
    // データを取得
    // ============================================
    
    let drillData = null;
    if (typeof cmnDrillData !== 'undefined') {
        drillData = cmnDrillData;
    } else if (typeof window.cmnDrillData !== 'undefined') {
        drillData = window.cmnDrillData;
    }
    
    if (!drillData || !drillData[0] || !drillData[0].cmnDrlQuestionList) {
        console.log('❌ データが見つかりません！');
        return;
    }
    
    const questionList = drillData[0].cmnDrlQuestionList;
    const answers = {};
    
    console.log(`📌 モジュール名: ${drillData[0].moduleName}`);
    console.log(`📌 全 ${questionList.length} 問`);
    console.log('');
    
    // ============================================
    // 各問題の答えを抽出
    // ============================================
    
    questionList.forEach((q, index) => {
        let answer = null;
        let method = '';
        
        console.log(`========================================`);
        console.log(`🔍 問題${index+1} (パターン: ${q.questionPattern})`);
        
        // 赤文字の答えを最優先
        if (q.cmnDrlExplainList) {
            q.cmnDrlExplainList.forEach(exp => {
                const text = exp.text || '';
                
                let match = text.match(/<font[^>]*>【答え】([^<]+)<\/font>/);
                if (match) {
                    let ans = match[1].trim();
                    ans = ans.replace(/\n/g, '').trim();
                    ans = ans.replace(/\s+/g, ' ');
                    answer = ans;
                    method = '赤文字';
                    console.log(`  ✅ 赤文字: "${answer}"`);
                    return;
                }
                
                if (!answer) {
                    match = text.match(/答え[：:]\s*([a-d,]+)/);
                    if (match) {
                        answer = match[1].trim();
                        method = '答え:';
                        console.log(`  ✅ 答え:: "${answer}"`);
                        return;
                    }
                }
                
                if (!answer) {
                    const cleanText = text.replace(/<[^>]*>/g, '').trim();
                    if (cleanText.length > 0 && cleanText.length < 30 && !cleanText.includes('答え')) {
                        if (q.cmnDrlAnswerSelectList) {
                            for (let opt of q.cmnDrlAnswerSelectList) {
                                if (opt.text === cleanText) {
                                    answer = cleanText;
                                    method = '解説単語';
                                    console.log(`  ✅ 解説単語: "${answer}"`);
                                    return;
                                }
                                if (opt.text.includes(cleanText) || cleanText.includes(opt.text)) {
                                    answer = opt.text;
                                    method = '解説部分一致';
                                    console.log(`  ✅ 解説部分一致: "${answer}"`);
                                    return;
                                }
                            }
                        }
                        if (!answer && q.cmnDrlAnswerSelectList) {
                            const options = q.cmnDrlAnswerSelectList.map(o => o.text);
                            for (let opt of options) {
                                if (opt.includes(cleanText) || cleanText.includes(opt)) {
                                    answer = opt;
                                    method = '解説から推測';
                                    console.log(`  ✅ 解説から推測: "${answer}"`);
                                    return;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        if (!answer && q.cmnDrlAnswerSelectList) {
            const options = q.cmnDrlAnswerSelectList.map(o => o.text);
            console.log(`  選択肢: ${options.join('、')}`);
            
            if (q.cmnDrlExplainList) {
                q.cmnDrlExplainList.forEach(exp => {
                    const cleanText = exp.text.replace(/<[^>]*>/g, '').trim();
                    if (cleanText.length > 0 && cleanText.length < 30) {
                        for (let opt of options) {
                            if (opt === cleanText || opt.includes(cleanText) || cleanText.includes(opt)) {
                                answer = opt;
                                method = '選択肢から推測';
                                console.log(`  ✅ 選択肢から推測: "${answer}"`);
                            }
                        }
                    }
                });
            }
        }
        
        answers[index] = {
            answer: answer || null,
            method: method || '未検出'
        };
        
        if (!answer) {
            console.log(`❌ 問題${index+1}: 答えが見つかりません`);
        }
    });
    
    console.log('========================================');
    console.log('📋 全問の答え:');
    console.log('========================================');
    
    for (let i = 0; i < questionList.length; i++) {
        const data = answers[i];
        if (data && data.answer) {
            console.log(`✅ 問題${i+1}: ${data.answer} [${data.method}]`);
        } else {
            console.log(`❌ 問題${i+1}: 未検出`);
        }
    }
    
    // ============================================
    // スタイル追加
    // ============================================
    
    if (!document.getElementById('glowStyle')) {
        const style = document.createElement('style');
        style.id = 'glowStyle';
        style.textContent = `
            .simple-glow {
                background-color: #FFD700 !important;
                box-shadow: 0 0 20px #FFD700, 0 0 40px #FFA500 !important;
                border-radius: 8px !important;
                padding: 2px 12px !important;
                transition: all 0.3s ease !important;
                font-weight: bold !important;
                display: inline-block !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // ============================================
    // 画面左下に表示
    // ============================================
    
    const oldDiv = document.getElementById('answerDisplay');
    if (oldDiv) oldDiv.remove();
    
    const displayDiv = document.createElement('div');
    displayDiv.id = 'answerDisplay';
    displayDiv.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        left: 20px !important;
        background: rgba(0, 0, 0, 0.9) !important;
        color: #FFFFFF !important;
        padding: 15px 20px !important;
        border-radius: 12px !important;
        font-family: 'MS PGothic', 'Meiryo', sans-serif !important;
        font-size: 14px !important;
        line-height: 1.8 !important;
        z-index: 99999 !important;
        max-width: 500px !important;
        max-height: 80vh !important;
        overflow-y: auto !important;
        border: 2px solid #FFD700 !important;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.3) !important;
        pointer-events: none !important;
    `;
    
    const totalQuestions = questionList.length;
    let foundCount = 0;
    let html = `<div style="font-weight: bold; color: #FFD700; font-size: 16px; margin-bottom: 8px; border-bottom: 1px solid #FFD700; padding-bottom: 5px;">📋 全問の答え (${totalQuestions}問)</div>`;
    
    for (let i = 0; i < totalQuestions; i++) {
        const data = answers[i];
        if (data && data.answer) {
            html += `<div>✅ 問題${i+1}: <span style="color: #FFD700; font-weight: bold;">${data.answer}</span> <span style="color: #888; font-size: 11px;">[${data.method}]</span></div>`;
            foundCount++;
        } else {
            html += `<div>❌ 問題${i+1}: <span style="color: #FF6B6B;">未検出</span></div>`;
        }
    }
    
    html += `<div style="border-top: 1px solid #555; margin-top: 8px; padding-top: 8px; color: #AAA; font-size: 12px;">`;
    html += `検出: ${foundCount}/${totalQuestions} 問`;
    html += `</div>`;
    
    displayDiv.innerHTML = html;
    document.body.appendChild(displayDiv);
    
    console.log(`✅ 画面左下に ${foundCount}/${totalQuestions} 問の答えを表示しました`);
    
    // ============================================
    // 選択肢を光らせる
    // ============================================
    
    let glowCount = 0;
    
    questionList.forEach((q, index) => {
        const data = answers[index];
        if (!data || !data.answer) return;
        
        const correctAnswer = data.answer;
        console.log(`🔦 問題${index+1}: 光らせ中...`);
        
        // 選択肢を取得
        if (q.cmnDrlAnswerSelectList) {
            q.cmnDrlAnswerSelectList.forEach(option => {
                const text = option.text;
                // 正解かチェック（複数対応）
                const isCorrect = text === correctAnswer || 
                                 correctAnswer.includes(text) || 
                                 text.includes(correctAnswer) ||
                                 correctAnswer.split(',').some(c => c.trim() === text);
                
                if (isCorrect) {
                    // 画面上の該当要素を探す
                    const links = document.querySelectorAll(`#menu_${index} .single_answer`);
                    links.forEach(el => {
                        if (el.textContent.trim() === text || 
                            correctAnswer.includes(el.textContent.trim())) {
                            el.classList.add('simple-glow');
                            glowCount++;
                            console.log(`  ✅ 問題${index+1}: 「${text}」を光らせた`);
                        }
                    });
                }
            });
        }
        
        // 選択肢がない場合はテキストを光らせる
        if (!q.cmnDrlAnswerSelectList || q.cmnDrlAnswerSelectList.length === 0) {
            const qtxts = document.querySelectorAll(`#questions_${index} .qtxt`);
            qtxts.forEach(p => {
                const text = p.textContent.trim();
                if (text.includes(correctAnswer) || correctAnswer.includes(text)) {
                    p.classList.add('simple-glow');
                    glowCount++;
                    console.log(`  ✅ 問題${index+1}: テキストを光らせた`);
                }
            });
        }
    });
    
    if (glowCount > 0) {
        console.log(`✅ 選択肢を ${glowCount} 件光らせました`);
    } else {
        console.log('⚠️ 光らせた選択肢はありませんでした');
    }
    
    console.log('========================================');
    console.log('🎉 完了！');
    console.log('💡 答えは画面左下、正解の選択肢は光っています');
    
})();
