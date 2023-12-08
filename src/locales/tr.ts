import type { Locales } from "../Structure";

type strOrNum = string | number;

export default {
    code: "tr-TR",
    errorAtRuntime: "Görünüşe göre bir hata ile karşılaştınız. Endişelenmeyin! Botun sahibine çoktan bir hata mesajı gönderildi. Kendisine Discord üzerinden @yorunoken adresinden ulaşabilirsiniz.",
    embeds: {
        page: (page: string) => `Sayfa ${page}`,
        otherPlays: "**__Beatmap'teki başka skorlar:__**",
        provideUsername: "Lütfen bir isim belirtin",
        prefix: {
            provideFlags: "Lütfen herhangi bir tanesini belirtin: `add, remove, list`.",
            prefixAlreadySet: (prefix: string) => `${prefix} prefix'i sunucuya zaten tanımlı!`,
            maxPrefix: (maxPrefix: string) => `Bu sunucuya eklenebilecek maksimum prefix: ${maxPrefix}`,
            prefixAdded: (prefix: string) => `${prefix} prefix'i sunucuya eklendi!`,
            noPrefixes: "Bu sunucuya tanımlı herhangi bir prefix yok.",
            serverDoesntHavePrefix: "Bu prefix sunucuya tanımlı değil.",
            prefixRemoved: (prefix: string) => `${prefix} prefix'i sunucudan kaldırıldı!`,
            currentPrefixes: (prefixes: string) => `Sunucuda tanımlı prefix'ler: ${prefixes}`
        },
        help: {
            title: "Bir komutun detayları için `help <command>` kullanın",
            commandNotFound: (name: string) => `${name} isimli komut bulunamadı.`,
            commandInfoTitleEmbed: (name: string) => `${name} İsimli komutun bilgileri`,
            botInfo: "Bot Bilgileri",
            botServerCount: (length: string) => `${length} adet sunucuya servis vermekte`,
            botUptime: (uptime: string) => `${uptime} başladı`, // uptime will display "X seconds/minuts/hours ago"
            commands: "Komut Kullanımı"
        },
        leaderboard: {
            noScores: "Bu beatmap'in sıralamasında hiç skor yok.",
            global: "Küresel",
            country: "Türk",
            type: (type: string) => `${type} sıralaması gösteriliyor.`,
            playScore: (userId: strOrNum) => `<@${userId}> kişisinin skoru:`
        },
        map: {
            beatmapBy: (username: string) => `Beatmap ${username} tarafından`,
            stars: "Zorluk",
            mods: "Modlar",
            length: "Uzunluk",
            maxCombo: "Maksimum Kombo",
            objects: "Objeler",
            links: "Bağlantılar",
            ranked: "dereceli",
            loved: "sevilmiş",
            qualified: "seçkin",
            pending: "beklemede",
            graveyard: "mezarlıkta"
        },
        link: {
            success: (id: strOrNum, username: string) => `Discord hesabı (<@${id}>) başarılı bir şekilde ${username} isimli oyuncuya bağlandı`
        },
        plays: {
            top: "yüksek skorlu",
            recent: "yakın zamanlı",
            noScores: (username: string, type: string) => `\`${username}\` tarafından oynanılan ${type} bir skor bulunamadı.`,
            playsFound: (length: number) => `\`${length}\` adet skor bulundu`,
            try: "Deneme",
            length: "Uzunluk",
            mapper: (username: string) => `${username} tarafından`
        },
        whatif: {
            count: "bir",
            plural: "",
            samePp: (pp: strOrNum, username: string) => `Bir ${pp}pp skoru ${username} kişisinin yüksek 100 skorlarının arasından olmaz, dolayısıyla sıralaması ve pp'si değişmez.`,
            title: (username: string, count: strOrNum, pp: strOrNum) => `${username} ${count} adet yeni ${pp}pp skor alırsa ne olur`,
            description: (
                length: strOrNum,
                pp: strOrNum,
                username: string,
                plural: string,
                position: strOrNum,
                newPp: strOrNum,
                diffPp: strOrNum,
                rank: strOrNum,
                rankDiff: strOrNum
            ) => `${length} adet yeni ${pp}pp skoru ${username} kişisinin #${position} yüksek skoru olur.
            Toplam pp'sini ${newPp}'e çıkarır, pp farkı ${diffPp} olur ve sıralamasını #${rank}'e çıkarır (+${rankDiff}).`
        },
        pp: {
            ppHigh: (username: string) => `${username} zaten o pp'den daha yüksekte.`,
            playerMissing: (username: string, pp: strOrNum) => `${username}, ${pp}pp'ye ulaşmak için kaç pp skor yapması gerekiyor?`,
            description: (
                username: string,
                target: strOrNum,
                pp: strOrNum,
                position: strOrNum,
                rank: strOrNum
            ) => `${username}, **${target}pp**'ye ulaşmak için bir **${pp}pp** skoru yapması gerekiyor. Bu skor #${position} pozisyonunda olup, sıralamasını **#${rank}** sayısına çıkarır.`
        },
        rank: {
            rankHigh: (username: string) => `${username} zaten o sıralamadan yükste.`,
            playerMissing: (username: string, rank: strOrNum) => `${username}, #${rank} sıralamasına ulaşmak için kaç pp skor yapması gerekiyor?`,
            description: (
                username: string,
                target: strOrNum,
                pp: strOrNum,
                position: strOrNum,
                newPp: strOrNum
            ) => `${username}, **#${target}** sıralamasına ulaşmak için bir **${pp}pp** skoru yapması gerekiyor. Bu skor #${position} pozisyonunda olup, toplam pp'sini **${newPp}** sayısına yükseltir.`
        },
        profile: {
            peakRank: "Zirve Sıralaması",
            achieved: "Kazanıldı",
            statistics: "İstatistikler",
            accuracy: "İsabetlilik",
            level: "Seviye",
            playcount: "Oynama Sayısı",
            followers: "Takipçiler",
            maxCombo: "Maksimum Kombo",
            recommendedStars: "Önerilen Zorluk Seviyesi",
            grades: "Kademeler",
            joinDate: (date: string, ago: strOrNum) => `osu'ya ${date} tarihinde katıldı (${ago} yıl önce)`,
            score: "Skorlar",
            rankedScore: "Dereceli Skor",
            totalScore: "Toplam Skor",
            objectsHit: "Tıklanan Objeler",
            profile: "Profil"
        },
        nochoke: {
            alreadyDownloading: (username: string) => `Bot şu anda ${username} kişisinin skorlarını indiriyor. Lütfen sabırlı olun.`,
            mapsArentInDb: (username: string, missingMaps: strOrNum) => `${username} kişisinin \`${missingMaps}\` adet skoru botun veritabanında bulunmamaktadır. Lütfen bot beatmap'leri indirirken bekleyin.`,
            mapsDownloaded: "Beatmap'ler indirildi, hazırlanıyor.",
            approximateRank: (pp: strOrNum, rank: strOrNum) => `${pp}pp için yaklaşık sıralama: #${rank}`
        }
    },
    classes: {
        occupation: "Meslek",
        interests: "İlgi Alanları",
        location: "Konum",
        globalRank: "Küresel Sıralama",
        ifFc: (accuracy: string, pp: strOrNum) => `${accuracy} ile FC ${pp}pp'dir`,
        songPreview: "Şarkı Önizleme",
        mapPreview: "Harita Önizleme",
        fullBackground: "Arka Plan",
        ranked: "Dereceli Olma Tarihi",
        loved: "Sevilen Olma Tarihi",
        qualified: "Seçkin Olma Tarihi",
        updatedAt: "Son Güncelleme Tarihi"
    },
    fails: {
        languageDoesntExist: "Bu dil /locales içinde mevcut değil. [Github üzerinden bir pull request açmayı düşünün](https://github.com/YoruNoKen/HanamiBot) :)",
        channelDoesntExist: "Bu kanal mevcut değil.",
        linkFail: "Bir şeyler yanlış gitti, kullanıcı adını tırnak içine almayı deneyin (`).",
        userDoesntExist: (user: string) => `${user} kişisi Bancho'da mevcut değil.`,
        userHasNoScores: (user: string) => `${user} kişisinin, bu beatmap üzerinde skoru yok.`,
        provideValidPage: (maxValue: strOrNum) => `Lütfen geçerli bir sayfa numarası sağlayın (1 ile ${maxValue} arasında).`,
        noLeaderboard: "Ya bu harita mevcut değil ya da bir sıralama tahtası yok.",
        noBeatmapIdInCtx: "Bu konuşmada gömülü herhangi bir beatmap bulunamadı.",
        error: "Bir şeyler yanlış gitti.",
        interactionError: "Bu etkileşimde bir hata oluştu. Lütfen tekrar deneyin.",
        cooldownTime: (cooldown: string) => `${cooldown} içinde lütfen tekrar deneyin`,
        userButtonNotAllowed: "Bu düğmelere tıklayabilmek için komutu başlatan kişi olmanız gerekiyor."
    },
    modals: {
        enterValue: "Bir değer girin",
        valueInsert: (maxValue: strOrNum) => `Değerinizi buraya girin. (1-${maxValue})`
    },
    misc: {
        success: "Başarı!",
        warning: "Uyarı!",
        poweredBy: "YoruNoKen'in osu! supporter'ı ile sağlanmıştır",
        languageSet: (language: string) => `Dil başarıyla ${language} olarak ayarlandı`,
        feedbackSent: "Geri bildirim gönderildi, teşekkür ederiz!"
    }
} as Locales;
