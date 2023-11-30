import { ActionRowBuilder, Interaction, InteractionType, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ButtonActions } from "../classes";
import { ExtendedClient } from "../Structure";
import BaseEvent from "../Structure/BaseEvent";
import { db } from "./ready";

export default class InteractionCreateEvent extends BaseEvent {
  constructor(client: ExtendedClient) {
    super(client);
  }

  public async execute(interaction: Interaction): Promise<void> {
    if (!interaction.guildId) {
      return;
    }

    if (interaction.isModalSubmit()) {
      const message = interaction.message;
      if (!message) {
        return;
      }
      const sillyOptions = this.client.sillyOptions[message.id];
      if (!sillyOptions.buttonHandler) {
        return;
      }

      const index = sillyOptions.embedOptions.index ? Number(interaction.fields.getTextInputValue("index")) : null;
      const page = sillyOptions.buttonHandler === "handleTopsButtons" && !sillyOptions.embedOptions.index ? Number(interaction.fields.getTextInputValue("page")) : null;
      const playsLength = sillyOptions.embedOptions.plays.length;

      if ((index || page)! > (sillyOptions.buttonHandler === "handleRecentButtons" ? playsLength : sillyOptions.embedOptions.index ? playsLength : Math.ceil(playsLength / 5)) || (index || page)! < 0) {
        return;
      }

      index ? (sillyOptions.embedOptions.index = Number(index) - 1) : null;
      page ? (sillyOptions.embedOptions.page = Number(page) - 1) : null;

      await interaction.deferUpdate();
      await ButtonActions[sillyOptions.buttonHandler]({ i: interaction, options: sillyOptions.embedOptions, pageBuilder: sillyOptions.pageBuilder, response: sillyOptions.response });
    }

    if (interaction.type === InteractionType.MessageComponent && interaction.isButton()) {
      const message = interaction.message;
      const sillyOptions = this.client.sillyOptions[message.id];

      if (interaction.user.id !== sillyOptions.initializer.id) {
        interaction.reply({ ephemeral: true, content: "You need to be the one who initialized the command to be able to click the buttons." });
        return;
      }

      if (interaction.customId === "indexbtn") {
        const playsLength = sillyOptions.embedOptions.plays.length;
        const modal = new ModalBuilder().setCustomId("myModal").setTitle("Enter a value");
        const favoriteColorInput = new TextInputBuilder()
          .setCustomId(sillyOptions.buttonHandler === "handleRecentButtons" ? "index" : sillyOptions.embedOptions.index ? "index" : "page")
          .setLabel(`Your value here. (1-${sillyOptions.buttonHandler === "handleRecentButtons" ? playsLength : sillyOptions.embedOptions.index ? playsLength : Math.ceil(playsLength / 5)})`)
          .setStyle(TextInputStyle.Short);

        const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(favoriteColorInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
        return;
      }

      if (sillyOptions.buttonHandler) {
        await ButtonActions[sillyOptions.buttonHandler]({ i: interaction, options: sillyOptions.embedOptions, pageBuilder: sillyOptions.pageBuilder, response: sillyOptions.response });
      }
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
      try {
        const command = this.client.slashCommands.get(interaction.commandName);
        command.run({ client: this.client, interaction, db });
      } catch (e) {
        console.error(e);
        interaction.reply({ content: "There was an error with this interaction. Please try again.", ephemeral: true });
      }
    }
  }
}
